#!/usr/bin/env python3
"""Обновляет news.json свежими новостями искусства из общедоступной RSS-ленты."""

from __future__ import annotations

import html
import json
import os
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "news.json"
QUERY = "искусство выставки музеи художники"
FEED_URL = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
    {"q": QUERY, "hl": "ru", "gl": "RU", "ceid": "RU:ru"}
)
MONTHS = (
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
)


def clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    return " ".join(html.unescape(value).split())


def format_date(value: datetime) -> str:
    return f"{value.day} {MONTHS[value.month - 1]} {value.year}"


def main() -> None:
    local_feed = os.environ.get("NEWS_FEED_FILE")
    if local_feed:
        feed_data = Path(local_feed).read_bytes()
    else:
        request = urllib.request.Request(
            FEED_URL,
            headers={"User-Agent": "Mozilla/5.0 (compatible; AzarovaArtNews/1.0)"},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            feed_data = response.read()
    root = ET.fromstring(feed_data)

    records: list[tuple[datetime, dict[str, str]]] = []
    seen: set[str] = set()
    for item in root.findall("./channel/item"):
        title = clean_text(item.findtext("title", ""))
        link = clean_text(item.findtext("link", ""))
        published = clean_text(item.findtext("pubDate", ""))
        source = clean_text(item.findtext("source", ""))
        if not title or not link or link in seen:
            continue
        try:
            published_at = parsedate_to_datetime(published)
        except (TypeError, ValueError):
            published_at = datetime.now(timezone.utc)
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)
        seen.add(link)
        description = f"Источник: {source}." if source else "Новости искусства и выставочной жизни."
        records.append(
            (
                published_at,
                {
                    "date": format_date(published_at),
                    "title": title,
                    "description": description,
                    "link": link,
                },
            )
        )

    records.sort(key=lambda record: record[0], reverse=True)
    items = [record[1] for record in records[:15]]
    if not items:
        raise RuntimeError("RSS-лента не вернула ни одной новости")
    OUTPUT.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
