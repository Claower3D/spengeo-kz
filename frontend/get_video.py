import urllib.request
import re
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

url = "https://www.pexels.com/search/videos/construction/"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})

try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    match = re.search(r'https://videos\.pexels\.com/video-files/\d+/[^\s"\'<>]+?\.mp4', html)
    if match:
        video_url = match.group(0)
        print(f"Downloading {video_url}...")
        urllib.request.urlretrieve(video_url, "public/videos/hero.mp4")
        print("Done! Video successfully replaced.")
    else:
        print("No video found.")
except Exception as e:
    print("Error:", e)
