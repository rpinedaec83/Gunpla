(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let data = [
    {
        nombre: "Aldo Perich",
        id: "aperich",
        redes: ["https://www.instagram.com/gunpla_warrior_peru/"],
        img: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 4, 15, 16
        ]
    },
    {
        nombre: "Daniel Campos",
        id: "dcampos",
        redes: ["https://www.instagram.com/d.de.daniel", "https://www.instagram.com/pun.san_gunpla"],
        img: [
            29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49
        ]
    },
    {
        nombre: "Cristhian Luna",
        id: "cluna",
        redes: ["https://www.instagram.com/cristhian_ls17", "https://www.tiktok.com/@rayitothecat"],
        img: [
            23, 24, 25, 26, 27, 28
        ]
    },
    {
        nombre: "Fernando Garaicoa - fog1labs",
        id: "fog1labs1",
        redes: ["https://www.instagram.com/fog1labs", "https://www.facebook.com/Fog1Labsmodelbuilder", "https://www.tiktok.com/@fog1labs1"],
        img: [
            50,
            51,
            52,
            53,
            54,
            55,
            56,
            57,
            58,
            59,
            60,
            61,
            62,
            63,
            64,
            65,
            66,
            67,
            68,
            69,
            70,
            71,
            72,
            73,
            74,
            75,
            76,
            77,
            78,
            79,
            80,
            81,
            82,
            83,
            84,
            85,
            86,
            87,
            88,
            89,
            90,
            91,
            92,
            93
        ]
    }
];

function shuffle(arr) {
    arr.forEach((val, key) => {
        randomIndex = Math.ceil(Math.random() * (key + 1));
        arr[key] = arr[randomIndex];
        arr[randomIndex] = val;
    });
    return arr;
}

let arrShuffle = [];
let arrImg = []
data.forEach(element => {
    // console.log(element.img)
    let imgs = element.img;
    imgs.forEach(datos => {
        let data = {
            img: datos,
            nombre: element.nombre,
            redes: element.redes,
            id: element.id
        }
        arrImg.push(data);
    });
});

arrShuffle = shuffle(arrImg);
//console.log(arrShuffle)

/*
<article class="thumb">
                <a href="images/fulls/01.jpg" class="image"><img src="images/thumbs/01.jpg" alt="" /></a>
                <h2>Magna feugiat lorem</h2>
                <p>Nunc blandit nisi ligula magna sodales lectus elementum non. Integer id venenatis velit.</p>
            </article>
*/
let divMain = document.getElementById("main");
let strHtml = "";
arrShuffle.forEach(element => {
    let strRedes = "";
    element.redes.forEach(red => {
        strRedes += `<a href="${red}" target="_blank">${red}</a><br>`
    });
    strHtml += `<article class="thumb">
    <a href="images/${element.id}/fulls/${element.img}.jpg" class="image"><img src="images/${element.id}/thumbs/${element.img}.jpg" alt="" /></a>
    <h2>${element.nombre}</h2>
    <p>${strRedes}</p>
</article>`;
});

divMain.innerHTML = strHtml;

},{}]},{},[1]);
