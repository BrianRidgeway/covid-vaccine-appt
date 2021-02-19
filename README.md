# covid-vaccine-appt

## Install

```
npm install
```

## Description and Usage

Can be used to scrape a COVID vaccine appt website.

Requires the creation of the config file `config.json`.

Config Params include:

* puppeteer: any configuration params you want to send to `puppeteer.launch`, default={}
* maxWait: time in ms you want to wait before executing the scrape, default=0
* url: url of the COVID vaccination appointment site to use, REQUIRED
* state: US State abbreviation for the state you are searching for an appointment, REQUIRED


Example:
```
{
  "puppeteer": {
    "executablePath": "/usr/bin/chromium"
  },
  "maxWait": "30000",
  "url": "https://www.pharmacy.com/immunizations/covid-19-vaccine"
  "state": "TX"
}
```
