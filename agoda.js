const fetch = require('node-fetch');
const fs = require('fs-extra');
const readline = require("readline-sync");
var randomize = require('randomatic');
const cheerio = require('cheerio');
var random = require('random-name');

var key = ``
var password = `jancok90`

const functionCreateTask = () => new Promise((resolve, reject) => {
    const bodys = {
        "clientKey":key,
        "task":
        {
            "type":"RecaptchaV2TaskProxyless",
            "websiteURL":"https://www.agoda.com/id-id/signup?targeturl=%2Fid-id%2F",
            "websiteKey":"6LfGHMcZAAAAAAN-k_ejZXRAdcFwT3J-KK6EnzBE"
        }
     } 
   
    fetch('http://api.anti-captcha.com/createTask', { 
        method: 'POST', 
        body: JSON.stringify(bodys)
    })
    .then(res => res.json())
    .then(result => {
        resolve(result);
    })
    .catch(err => reject(err))
});

const functionResult = (task) => new Promise((resolve, reject) => {
    const bodys = {
        "clientKey":key,
        "taskId": task
     } 
   
    fetch('https://api.anti-captcha.com/getTaskResult ', { 
        method: 'POST', 
        body: JSON.stringify(bodys)
    })
    .then(res => res.json())
    .then(result => {
        resolve(result);
    })
    .catch(err => reject(err))
});

const functionRegist = (resCaptcha, email) => new Promise((resolve, reject) => {
    const bodys = {
        "credentials":{
            "username":email,
            "password":password,
            "authType":"email"
        },
        "firstName":random.first(),
        "lastName":random.last(),
        "newsLetter":true, 
        "captchaVerifyInfo":{
            "captchaType":"recaptcha",
            "captchaResult":{
                "recaptchaToken":resCaptcha
            }
        }
    }
      
    fetch('https://www.agoda.com/ul/api/v1/signup', { 
        method: 'POST', 
        body: JSON.stringify(bodys),
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': 'www.agoda.com',
            'Origin': 'https://www.agoda.com',
            'UL-App-Id': 'mspa',
            'UL-Fallback-Origin': 'https://www.agoda.com',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.82 Mobile Safari/537.36'
        }
    })
    .then(async res => {
        const $ = cheerio.load(await res.text());
        const result = res.headers.raw()['set-cookie']

        resolve(result)
    })
    .catch(err => reject(err))
});

const functionClaimApk = (token) => new Promise((resolve, reject) => {
    fetch('https://www.agoda.com/app/agodacashcampaign?campaignToken=8a126505ef0fcf80769338910e5579f9e19c4b20&refreshOnBack&view=nativeapp', { 
        redirect: 'manual',
        headers: {
            Cookie: `token=${token};`
        }
    })
    .then(res => res.text())
    .then(result => {
        resolve(result);
    })
    .catch(err => reject(err))
});

const functionClaimWeb = (token) => new Promise((resolve, reject) => {
    fetch('https://www.agoda.com/id-id/app/agodacashcampaign?campaignToken=b6ee49c1fc6734aa0eae8b75014cbd3032b1fea3&refreshOnBack=', { 
        redirect: 'manual',
        headers: {
            Cookie: `token=${token};`
        }
    })
    .then(res => res.text())
    .then(result => {
        resolve(result);
    })
    .catch(err => reject(err))
});

(async () => {

    const jumlah = readline.question('Jumlah akun : ')

    console.log("")

    for(var i = 0; i < jumlah; i++){

        try {

            const email = `${random.first()}${randomize('0', 5)}@gmail.com`.toLowerCase()

            const getTask = await functionCreateTask()
            const task = getTask.taskId
    
            console.log(`Mencoba mendapatkan captcha | ${email}`)
    
            do{
                var getResult = await functionResult(task)
                if(getResult.status != 'processing'){
                    console.log('Captcha ready')
                }
            } while(getResult.status == 'processing')
    
            const resCaptcha = getResult.solution.gRecaptchaResponse

            const regist = await functionRegist(resCaptcha, email)
            if(regist[0].includes('token')){
                console.log('Regist berhasil')

                const token = regist[0].split(';')[0].split('ul.token=')[1]
                const claimApk = await functionClaimApk(token)

                if(claimApk){
                    console.log('Claim apk sukses')

                    const claimWeb = await functionClaimWeb(token)
                    if(claimWeb){
                        console.log('Claim web sukses\n')

                        await fs.appendFile('resultAgoda.txt',`${email}|${password}`+'\r\n', err => {
                            if (err) throw err;
                          })

                    } else {
                        console.log('Claim web gagal\n')
                    }

                } else {
                    console.log('Claim apk gagal\n')
                }
            } else {
                console.log('Regist gagal\n')
            }


        } catch(e) {
            console.log(e)
        }
    }
})();