function getQueryStringObject() {
    var a = window.location.search.substr(1).split('&');
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0].replace(/\?/g, "")] = decodeURIComponent(p[1]);
    }
    return b;
}

var qs = getQueryStringObject();

if (qs.h) {
    localStorage.setItem('host', qs.h);
}
if (qs.at) {
    localStorage.setItem('at', qs.at);
}
if (qs.ac) {
    localStorage.setItem('ac', qs.ac);
}

const host = localStorage.getItem('host');
const accessToken = localStorage.getItem('at');
const authCode = localStorage.getItem('ac');

var lastNoteDate = 0
var lastNoteText = ''
if (localStorage.getItem('lastNote')) {
    lastNoteDate = new Date(localStorage.getItem('lastNoteDate'))
    lastNoteText = localStorage.getItem('lastNoteText')
}

var tarotArray = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
    'Ace of Cups', 'Two of Cups', 'Three of Cups', 'Four of Cups', 'Five of Cups', 'Six of Cups', 'Seven of Cups', 'Eight of Cups', 'Nine of Cups', 'Ten of Cups', 'Page of Cups', 'Knight of Cups', 'Queen of Cups', 'King of Cups', 
    'Ace of Pentacles', 'Two of Pentacles', 'Three of Pentacles', 'Four of Pentacles', 'Five of Pentacles', 'Six of Pentacles', 'Seven of Pentacles', 'Eight of Pentacles', 'Nine of Pentacles', 'Ten of Pentacles', 'Page of Cups', 'Knight of Pentacles','Queen of Pentacles', 'King of Pentacles', 
    'Ace of Wands', 'Two of Wands', 'Three of Wands', 'Four of Wands', 'Five of Wands', 'Six of Wands', 'Seven of Wands', 'Eight of Wands', 'Nine of Wands', 'Ten of Wands', 'Page of Wands', 'Knight of Wands', 'Queen of Wands', 'King of Wands', 
    'Ace of Sword', 'Two of Sword', 'Three of Sword', 'Four of Sword', 'Five of Sword', 'Six of Sword', 'Seven of Sword', 'Eight of Sword', 'Nine of Sword', 'Ten of Sword', 'Page of Sword', 'Knight of Sword', 'Queen of Sword', 'King of Sword', 
]

var tarot = tarotArray[Math.floor(Math.random() * 78)];

if (accessToken) {

    var nownow = new Date()
    var ampm = ' AM'
    if (nownow.getHours() > 11) {
        ampm = ' PM'
    }
    if (nownow - lastNoteDate > 2*3600*1000) {
        var msgs = [{"role": "system", "content": `You are an assistant who provides inspiration and help with creation. Your job is to ask one question about the character itself or their relationship with people around them. The question can be about the character, or if there are people around them, they could be a friend, a lover, or, rarely, a family member. I did a tarot reading, and the ${tarot} card appeared. I would like the question to be related to this. The more creative the question, the better, and it's okay to use hypothetical scenarios. For example the character can go to high school, university, be a certain club member, or have a trip. The important thing is that you should only answer with one sentence, which is the question you created, and do not use quotation marks.Please answer in Korean.`}]
        var sendChatUrl = 'https://api.openai.com/v1/chat/completions'
        var sendChatParam = {
            body: JSON.stringify({
                "model": "gpt-4o", 
                "messages": msgs, 
                "temperature": 0.7,
                "max_tokens": 180}),
            method: "POST",
            headers: {
                "content-type": "application/json",
                Authorization: "Bearer " + authCode,
            }
        }
        fetch(sendChatUrl, sendChatParam)
        .then((chatData) => {return chatData.json()})
        .then((chatRes) => {
            console.log(chatRes)
            if (chatRes.choices) {
                var autoNoteText = chatRes.choices[0].message.content
                var autoNoteUrl = 'https://'+host+'/api/notes/create'
                var autoNoteParam = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'Authorization': `Bearer `+accessToken,
                    },
                    body: JSON.stringify({
                        visibility: 'home',
                        text: autoNoteText
                    }),
                    credentials: 'omit'
                }
                fetch(autoNoteUrl, autoNoteParam)
                .then((data) => {
                    localStorage.setItem('lastNote', true)
                    lastNoteDate = nownow
                    localStorage.setItem('lastNoteDate', nownow)
                    lastNoteText = autoNoteText
                    localStorage.setItem('lastNoteText', autoNoteText)
                    return data.json()
                })
                .then((res) => {
                    console.log(res)
                    setTimeout(() => {
                        location.href = 'https://hiyuno.peacht.art/characteridea/'
                    }, 20000);
                })
                .catch((error) => console.log(error))
            }
        })
        .catch((error) => {
            setTimeout(() => {
                location.href = 'https://hiyuno.peacht.art/characteridea/'
            }, 20000);
        });
    } else {
        setTimeout(() => {
            location.href = 'https://hiyuno.peacht.art/characteridea/'
        }, 20000);
    }
}