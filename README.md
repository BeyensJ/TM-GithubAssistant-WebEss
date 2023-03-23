![Thomas More University of Applied Sciences](logo.png)

# Controle Web Essentials

## Installatie

1. Installeer `npm install -g gulp-cli`
2. Installeer de node modules `npm install`
3. Update **.env** credentials
   - **CLASS**: vrij te kiezen string (vergeet de quotes niet!)
   - **GITHUB_USER**: uw persoonlijke GitHub user name
   - **GITHUB_PASSWORD**: uw GitHub token
   - **DATE_DEADLINE**: deadline "YYYY-MM-DD HH:mm:ss"
   - **GITHUB_PREFIX** prefix van de classroom
      - **1 ITF 01**: `https://github.com/itfactory-tm/2022_2023_1itf_01_webdesign_essentials-`
      - **1 ITF 02**: `https://github.com/itfactory-tm/2022_2023_1itf_02_webdesign_essentials-`
      - **1 ITF 03**: `https://github.com/itfactory-tm/2022_2023_1itf_03_webdesign_essentials-`
      - **1 ITF 04**: `https://github.com/itfactory-tm/2022_2023_1itf_04_webdesign_essentials-`
      - **1 ITF 05**: `https://github.com/itfactory-tm/2022_2023_1itf_05_webdesign_essentials-`
      - **1 ACS 01**: `https://github.com/itfactory-tm/2022_2023_1acs_webdesign_essentials-`
      - **1 ACS 02**: `https://github.com/itfactory-tm/2022_2023_1acs2_webdesign_essentials-`
      - **1 WT**: `https://github.com/itfactory-tm/2022_2023_1WT_Webdesign_Essentials-`
    
3. Voeg alle studenten van deze klas toe aan `students.json`
   - Lijst van github usernames
    
4. Start de **Gulp task** and let the magic begin...

## Gulp tasks

- `gulp clone`:  
Clone repos, maak overzichtspagina, maak per repo een overzichtspagina met links naar alle oefeningen, start de webserver
- `gulp delete`:  
Verwijder alle repos
- `gulp`:  
Start de webserver
