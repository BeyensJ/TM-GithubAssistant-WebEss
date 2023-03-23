const fs = require('fs');
const color = require('gulp-color');
const del = require('del');
const dotenv = require('dotenv').config();
const gulp = require('gulp');
const git = require('gulp-git');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const moment = require('moment');
const browserSync = require('browser-sync').create();

const deadline = moment(process.env.DATE_DEADLINE || '2021-01-08 23:59:59', 'YYYY-MM-DD HH:mm:ss');
const schoolStartDate = moment('2022-09-19 00:00:00');
const course = process.env.COURSE;
let prefix = process.env.GITHUB_PREFIX || 'https://github.com/xxx/';
let items = require('./students.json');
let students = [];
items.forEach((item, i) => {
    let student = {};
    // if student.githubUser contains only suffix, then make full GutHub URL
    student.username = item;
    student.repo = `${prefix}${item}`;
    // add student.folder to every student e.g: "John Doe" -> "John_doe"
    //student.folder = student.name.split(' ').join('_');
    // if not exists, add student.hosting
    //student.hosting = student.hasOwnProperty('hosting') ? student.hosting : '';
    students.push(student);
    
});
let weekLabels = [];
let dateReached = false;
let tempDate = new Date(schoolStartDate);

while(!dateReached){
    let weekNumber = getWeekNumber(tempDate);
    weekLabels.push(weekNumber.toString());
    tempDate.setDate(tempDate.getDate() + 7);
    if(tempDate > deadline){
        dateReached = true;
    }
}

function getWeekNumber(value){
    const datum = new Date(value);
    startDate = new Date(datum.getFullYear(), 0, 1);
    var days = Math.floor((datum - startDate) /
        (24 * 60 * 60 * 1000));

    return Math.ceil(days / 7);
}

gulp.task('delete-repos', function (cb) {
    // Delete the repos folder
    (async () => {
        await del(['repos']);
        console.log(color(`\n---------------------------------------`, 'GREEN'));
        console.log(color(`Repos deleted`, 'GREEN'));
        console.log(color(`---------------------------------------`, 'GREEN'));
        cb();
    })();
});

gulp.task('clone-repos', (cb) => {
    console.log(color(`\n---------------------------------------`, 'GREEN'));
    console.log(color(`Start cloning repos`, 'GREEN'));
    console.log(color(`---------------------------------------`, 'GREEN'));
    console.log(students.length);
    // Write last date of cloning to clone-date.json
    fs.writeFileSync('./clone-date.json', JSON.stringify({'date': moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}));

    const user = process.env.GITHUB_USER || 'demo';
    const password = process.env.GITHUB_PASSWORD || 'demo_pw';
    let counter = 0;



    students.forEach((student, i) => {
        // Add teacher credential to repo (https://user:password@github.com/...)
        let repo = student.repo.replace('//github.com', `//${encodeURIComponent(user)}:${encodeURIComponent(password)}@github.com`);

        git.clone(repo, {args: `./repos/${student.username}`}, async function (err, done) {
            if (err) {
                console.log(color(`Can't clone: ${students[i].username}`, 'RED'));
                throw err;
            } else {
                counter++
                console.log(color(`Cloning ${counter}/${students.length}:  ${student.username} done`, 'YELLOW'));
                //Read README file to get name, hosting and pexels
                const readme = fs.readFileSync(`repos/${student.username}/README.md`,{encoding:'utf8', flag:'r'});
                const readmeLC = readme.toLowerCase();
                let namesub = readme.substring(readmeLC.indexOf("name"), readmeLC.indexOf("name") + 150);
                let surnamesub = readme.substring(readmeLC.indexOf("surname"), readmeLC.indexOf("surname") + 150);
                student.name = namesub ? namesub.split("|")[1]?.trim() : "";
                student.surname = surnamesub ? surnamesub.split("|")[1]?.trim() : "";
                let webspace = "";
                let pexels = "";
                console.log(student.surname + " " + student.name);
                if(course == "WEBESS"){
                    let webspace = readme.substring(readmeLC.indexOf("webspace"), readmeLC.indexOf("webspace") + 150);
                    student.hosting = webspace ? webspace.split("|")[1]?.trim() : "";
                    let pexels = readme.substring(readmeLC.indexOf("pexels"), readmeLC.indexOf("pexels") + 150);
                    student.pexels = pexels ? pexels.split("|")[1]?.trim() : "";

                    console.log(student.hosting);
                    console.log(student.pexels);
                }

                if (counter === students.length) {
                    cb();
                }
            }
        });
    });
});

gulp.task('git-commits', (cb) => {
    console.log(color(`\n---------------------------------------`, 'GREEN'));
    console.log(color(`Get repo commits`, 'GREEN'));
    console.log(color(`---------------------------------------`, 'GREEN'));

    // add array with commits to every student
    let counter = 0;
    let previousdate = "";
    students.forEach((student, i) => {
        let commits = [];
        let contributions = [];
        git.exec({
            // https://git-scm.com/docs/pretty-formats
            args: 'log --pretty=format:"%h --$-- %an --$-- %ai --$-- %s',
            cwd: `./repos/${student.username}`
        }, function (err, gitlog) {
            if (err) {
                console.log(color(`Can't read log: ${student.username}`, 'RED'));
                throw err;
            } else {
                const rows = gitlog.split(/\n/);
                // const row = [];
                rows.reverse().forEach((r, i) => {
                    const cel = r.split(' --$-- ');
                    let commitDate = moment(cel[2], 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
                    let isShortPush = false;
                    if(i != 0){
                          isShortPush = Math.abs(moment(previousdate).diff(moment(commitDate), 'minutes')) <= 5;
                    }
                    previousdate = commitDate;
                    // console.log('cel[2]', cel[2], commitDate)

                    commits.push({
                        'hash': cel[0],
                        'name': cel[1],
                        'date': commitDate ,
                        'beforeDeadline': moment(deadline).diff(moment(commitDate), 'days') + ' days',
                        'commit': cel[3],
                        'shortPush': isShortPush
                    });
                });
                student.commits = commits.reverse();


                // Contributions Graph per person
                let personsContributed = [...new Set(student.commits.map(x => x.name))];
                personsContributed.forEach((pc) => {
                     let pcpw = [];
                    weekLabels.forEach((wl) => {
                        let contributionCount = student.commits.filter(x => getWeekNumber(x.date) == wl && x.name == pc).length;
                        pcpw.push({"week": wl ,"commits": contributionCount });
                    });
                    contributions.push({"name": pc, "contributions": pcpw});
                });

                student.contributions = contributions;

                /*console.log(student.name, JSON.stringify((student)));
                console.log(color(`Log: ${JSON.stringify(student.commits)}`, 'GREEN'));*/
                counter++
                if (counter === students.length) {
                    cb();
                }
            }
        });
    });
});

gulp.task('delete-git-folder', gulp.series((cb) => {
    console.log(color(`\n---------------------------------------`, 'GREEN'));
    console.log(color(`Delete git folder in repos`, 'GREEN'));
    console.log(color(`---------------------------------------`, 'GREEN'));
    let counter = 0;
    students.forEach((student, i) => {
        (async () => {
            const deleteLogs = await del([`repos/${student.username}/.git`]);
            counter++
            if (counter === students.length) {
                cb();
            }
        })();
    });
}));

gulp.task('index-pages', (cb) => {
    const title = `${process.env.CLASS || ''}`;

    const cloneDate = require('./clone-date.json');
    const lastUpdate = `Last cloned: ${cloneDate.date}`;
    students = students.sort((a,b) => (a.surname > b.surname) ? 1 : ((b.surname > a.surname) ? -1 : 0));

    students.forEach((student, i) => {
        student.sequence = i+1;
        let repo = student.repo;
        let githubUser = student.username;
        if(course == "WEBESS"){
            let hosting = student.hosting;
            let photo = student.pexels;
            let localRepo = student.username;
            let name = student.name + " " + student.surname;
            // make student_index.html in every student repo
            return gulp.src(`./student_index.html`)
                .pipe(replace('{{student_name}}', name))
                .pipe(replace('{{hosting}}', hosting))
                .pipe(gulp.dest(`./repos/${localRepo}`));
        }
    });
    // make index.html in 'repos'
    return gulp.src(`./master_index.html`)
        .pipe(rename('index.html'))
        .pipe(replace('{{reposTitle}}', title))
        .pipe(replace('{{lastUpdate}}', lastUpdate))
        .pipe(replace('moment({deadline})', `moment('${deadline})`))
        .pipe(replace('students = []', `students = ${JSON.stringify(students)};`))
        .pipe(replace('weekLabels[]', JSON.stringify(weekLabels)))
        .pipe(replace('{{course}}', course))
        //.pipe(replace('logsArr = [];', `logsArr = ${JSON.stringify(logs)};`))
        .pipe(gulp.dest(`./repos`));
});

gulp.task('browser-sync', (cb) => {
    browserSync.init({
        startPath: '/index.html',
        server: {
            baseDir: "./repos",
            directory: true
        }
    });
    // gulp.watch('./repos/**/*.scss', gulp.series('sass'));
    gulp.watch('./repos/**/*.{html,css,js,php}').on('change', browserSync.reload);
});


gulp.task('clone', gulp.series('delete-repos', 'clone-repos', 'git-commits', 'delete-git-folder', 'index-pages', 'browser-sync'));
gulp.task('default', gulp.series('browser-sync'));
gulp.task('delete', gulp.series('delete-repos'));

