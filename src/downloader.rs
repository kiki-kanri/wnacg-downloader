use anyhow::{Result, anyhow};
use regex::Regex;
use std::sync::LazyLock;

pub struct Downloader {
    aid: String,
}

static CAPTURE_URL_AID_REGEX: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"aid-(\d+)").unwrap());
static IS_NUMERIC_REGEX: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"^\d+$").unwrap());

impl Downloader {
    pub fn new(aid_or_url: impl AsRef<str>) -> Result<Self> {
        let aid_or_url = aid_or_url.as_ref().to_string();
        let aid = if IS_NUMERIC_REGEX.is_match(&aid_or_url) {
            aid_or_url
        } else {
            CAPTURE_URL_AID_REGEX
                .captures(&aid_or_url)
                .and_then(|caps| caps.get(1).map(|m| m.as_str().to_string()))
                .ok_or_else(|| anyhow!("無法從網址 '{aid_or_url}' 獲取到aid！"))?
        };

        return Ok(Downloader { aid });
    }
}
