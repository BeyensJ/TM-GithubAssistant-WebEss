![Thomas More University of Applied Sciences](logo.png)

# Controle Web Essentials

## Installatie

1. Installeer `npm install -g gulp-cli`
2. Installeer de node modules `npm install`
3. Update **.env** credentials
   - **CLASS**: vrij te kiezen string (vergeet de quotes niet!)
   - **GITHUB_USER**: uw persoonlijke GitHub user name
   - **GITHUB_PASSWORD**: uw GitHub token
   - **DATE_START**: eerste schooldag "YYYY-MM-DD HH:mm:ss"
   - **DATE_DEADLINE**: deadline "YYYY-MM-DD HH:mm:ss"
   - **GITHUB_PREFIX** prefix van de classroom
    
3. Voeg alle studenten van deze klas toe aan `students.json`
   - Lijst van github usernames
    
4. Start de **Gulp task** and let the magic begin...

*PS: Gebruik de templates van de **.env-template** en **students-template.json** files om van te vertrekken voor de juiste structuur van de **.env** en **students.json** files.*

## Gulp tasks

- `gulp clone`:  
Clone repos, maak overzichtspagina, maak per repo een overzichtspagina met links naar alle oefeningen, start de webserver
- `gulp delete`:  
Verwijder alle repos
- `gulp`:  
Start de webserver
