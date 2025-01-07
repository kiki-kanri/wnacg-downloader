use anyhow::Result;
use std::io::{self, Write};

#[tokio::main]
async fn main() -> Result<()> {
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
