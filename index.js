import fetch from 'node-fetch';

const srcTxtUrl = "http://norvig.com/big.txt";
const specialChars = /[`~!@#$%^&*()_|+\-=?;:'"0123456789\n,.<>\{\}\[\]\\\/]/gi;

const dictLookUpBaseUrl = 'https://dictionary.yandex.net/api/v1/dicservice.json/lookup';
const apiKey = 'dict.1.1.20210216T114936Z.e4989dccd61b9626.373cddfbfb8a3b2ff30a03392b4e0b076f14cff9';
const dictLang = 'en-en';
const dictLookUpUrl = `${dictLookUpBaseUrl}?key=${apiKey}&lang=${dictLang}&text`;

const TOP_N = 10;

fetch(srcTxtUrl)
    .then(res => res.text())
    .then(res => {
        const processedText = removeSpecialChars(res);
        const wordCountDict =  findWordCount(processedText);
        for(let i =0; i < TOP_N; i++){
            fetchWordFromDictionary(wordCountDict[i]);
        }
    })
    .catch(err => console.log("Error reading source text", err));


const removeSpecialChars = (text) => {
    return text.replace(specialChars, '');
}

const findWordCount = (text) => {
    const wordArray = text.split(' ').filter(function(i){return i});
    const wordCountDict = {};
    wordArray.map((word) => {
        if (wordCountDict[word]) {
            wordCountDict[word] =  wordCountDict[word] + 1;
        }
        else {
            wordCountDict[word] = 1;
        }
    }); // eg: {"that": 8572, in:"17765"}

    const wordCountArray = [];
    Object.keys(wordCountDict).map(item => { 
        wordCountArray.push(
            { word: item , count: wordCountDict[item]}
        )});  /* eg: [ {word:"that",count: 8572},{word:"in",count: 17765} ] */

    wordCountArray.sort((a,b) => {return b.count - a.count}); 
    return wordCountArray;
}

const fetchWordFromDictionary = ({word, count}) => {
    fetch(`${dictLookUpUrl}=${word}`)
    .then(res => res.json())
    .then(res => {
        console.log({word: word, output: {...processLookUpResponse(res), count: count}});
     })
    .catch(err => console.log("Error while looking up word in the dictionary",err))
}


const processLookUpResponse = (res) => {
    let response = {};
    res.def.map(item => { response["pos"] = item.pos});
    const synonyms = [];
    res.def.map(def => {def.tr && def.tr.map(item => {item.syn && item.syn.map(syn => { return synonyms.push(syn.text)} )}) });
    response["syns"] = synonyms;
    return response;
}


