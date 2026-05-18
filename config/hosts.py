from django_hosts import patterns, host

host_patterns = patterns(
    "",
    host(r"xakker\.org", "config.urls_landing", name="landing_root"),
    host(r"www\.xakker\.org", "config.urls_landing", name="landing"),
    host(r".+\.ngrok-free\.dev", "config.urls_landing", name="landing_ngrok"),
    host(r".+\.vercel\.app", "config.urls_landing", name="landing_vercel"),
    host(r"self-study\.xakker\.org", "config.urls_platform", name="platform"),
    host(r"localhost", "config.urls_landing", name="localhost_name"),
    host(r"127\.0\.0\.1", "config.urls_landing", name="localhost_ip"),
)
