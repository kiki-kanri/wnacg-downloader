use anyhow::Result;
use std::io::{self, Write};
use time::UtcOffset;
use time::macros::format_description;
use tracing_subscriber::fmt::time::OffsetTime;

#[tokio::main]
async fn main() -> Result<()> {
    let local_time_offset = UtcOffset::current_local_offset()?;
    let tracing_time_format = format_description!("[year]-[month]-[day] [hour]:[minute]:[second].[subsecond]");
    let tracing_timer = OffsetTime::new(local_time_offset, tracing_time_format);
    tracing_subscriber::fmt().with_timer(tracing_timer).init();
    loop {
        print!("請輸入網址或aid，多個請用空格分隔，未輸入則退出：");
        io::stdout().flush()?;
        let mut aids_or_urls_string = String::new();
        io::stdin().read_line(&mut aids_or_urls_string)?;
        let aids_or_urls_string = aids_or_urls_string.trim();
        if aids_or_urls_string.is_empty() {
            return Ok(());
        }
    }
}
