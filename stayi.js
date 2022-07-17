var country = "";
var language = "";
getCountry();
console.log(country && language ? `Country:${country}, Language: ${language}` : `Cannot determine country & language`);
//Get Country & Language from Browser
function getCountry() {
    country = navigator.languages[0].split("-")[1]
    language = navigator.languages[0].split("-")[0]
}

onPageLoad();
window.addEventListener('hashchange', function () {
    loading();
    if (!location.hash || location.hash == "#" || location.hash == "") {
        window.location = "#latest";
    }
    load();
}, false);

function onPageLoad() {
    loading();
    if (!location.hash || location.hash == "#" || location.hash == "") {
        window.location = "#latest";
    }
    load();
}

function load() {
    loading();
    if (location.hash == "#latest") {
        getLatest().then((data => { populate_Latest_Top(data); $(".heading").html("Latest News"); }));
    }
    else if (location.hash == "#latestdetails") {
        getTop().then((data => { populate_Latest_Top(data);$(".heading").html("Latest Details"); }));
    }
    else if (location.hash == "#top") {
        getTop().then((data => { populate_Latest_Top(data); $(".heading").html("Top News"); }));
    }
    else if (location.hash == "#searchTrends") {
        getGoogleSearchTrends().then((data => { populateGoogleSearchTrends(data);$(".heading").html("Search Trends"); }));
    }
    else if (location.hash == "#wikiTrends") {
        getWikiData().then((data => { populateMostRead(data);$(".heading").html("Wiki Trends"); }));
    }
    else if (location.hash == "#realtimeTrends") {
        getRealtimeTrends().then((data => { populateRealtimeTrends(data);$(".heading").html("Realtime Trends"); }));
    }
    else if (location.hash == "#hdx") {
        getHDX().then((data => { populateHDX(data) }));
    }
    else if (location.hash == "#hashtags") {
        getTrendingHashtags().then((data => { populateHashtags(data);$(".heading").html("Popular Hashtags"); }));
    }
    else if (location.hash == "#wpTop") {
        getwpTop().then((data => { populatewpTop(data);$(".heading").html("Top WP Sites");}));
    }
    else if (location.hash == "#RSS") {
        getRSS().then((data => { populateRSS(data);$(".heading").html("RSS"); }));
    }
    else if (location.hash == "#home") {
        getHomePageArticles().then((data => { populateHomePage(data); $(".heading").html("Home Page");}));
    }
    else if (location.hash == "#customRSS") {
        getCustomRSS().then((data => { populateCustomRSS(data); $(".heading").html("Custom RSS");}));
    }
}

function loading() {
    // $(".scroller").html("");
    // $(".scroller").html(`
    //     <div class="d-flex align-items-center">
    //         <strong>Loading...</strong>
    //         <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
    //     </div>
    // `);
    $(".content").html("");
    $(".content").html(`
        <div class="d-flex align-items-center">
            <strong>Loading...</strong>
            <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
        </div>
    `);
}

function listview(){
    if(location.hash == "#latest"){
        loading();
        getLatest().then((data => { populate_Latest_Top_List(data); $(".heading").html("Latest News"); }));
    }
}

function detailview(){
    if(location.hash == "#latest"){
        loading();
        getLatest().then((data => { populate_Latest_Top_Details(data); $(".heading").html("Latest News"); }));
    }
}

function gridlview(){
    if(location.hash == "#latest"){
        loading();
        getLatest().then((data => { populate_Latest_Top(data); $(".heading").html("Latest News"); }));
    }
}



function normalizeGDELT(results) {
    arr = []
    for (index in results) {
        if (results[index].articles) {
            results[index].articles.forEach(item => {
                var item_index = arr.findIndex(x => x.link == item.url);
                var title_index = arr.findIndex(x => x.title.trim().slice(0,20) == item.title.trim().slice(0,20));
                if (item_index === -1 && title_index === -1) {
                    var mDate = item.seendate.slice(0, 4) + "-" + item.seendate.slice(4, 6) + "-" + item.seendate.slice(6, 8)
                        + " " + item.seendate.slice(9, 11) + ":" + item.seendate.slice(11, 13)
                        + ":" + item.seendate.slice(13, 15);
                    var unixtime = Date.parse(mDate);
                    arr.push({ "title": item.title.replaceAll(" - ", "-").replaceAll(" %", "%").replaceAll(" .", "."), "created": unixtime, "link": item.url, "source": item.domain, "thumbnail": item.socialimage })
                }
            });
        }
    }
    arrr = arr.sort(function (a, b) {
        return b.created - a.created;
    });
    return arrr
}
function normalizeRedditData(results) {
    arr = []
    for (index in results) {
        results[index].data.children.forEach(item => {
            var item_index = arr.findIndex(x => x.link == item.data.url);
            if (item.data.url.includes("youtube") || item.data.url.includes("youtu.be") || item.data.url.includes("twitter.com") || item.data.url.includes("redd.it") || item.data.url.includes("reddit.com") || item.data.url.includes("imgur.com") || item.data.url.includes("gfycat.com")) {
                //do nothing
            } else {
                if (item_index === -1) {
                    arr.push({
                        "title": item.data.title,
                        "created": item.data.created,
                        "link": item.data.url,
                        "source": item.data.domain,
                        "thumbnail": item.data.thumbnail,
                    })
                }
            }
        });
    }
    arrr = arr.sort(function (a, b) {
        return b.created - a.created;
    });
    return arrr;
}

function getLatest() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("LatestNews")) {
                urls = ["https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=50&query=sourcelang:eng%20sourcecountry:India&timespan=1h",
                    "https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=50&query=sourcelang:eng%20sourcecountry:uk&timespan=1h",
                    "https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=50&query=sourcelang:eng%20sourcecountry:us&timespan=1h",
                ]
                async.mapLimit(urls, 11, async function (url) { try { const response = await fetch(url); return response.json() } catch (err) { return {} } }, (err, results) => { response = normalizeGDELT(results); setLocalStorage("LatestNews", response, 5 * 60000); resolve(response) })
            } else {
                resolve(getLocalStorage("LatestNews"));
            }
        } catch (err) { reject(err) }
    })
}
function getTop() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("TopNews")) {
                urls = [`https://www.reddit.com/r/worldnews+technology+business+finance+science+news+technews+economy/top/.json?t=day&limit=16`,
                    'https://www.reddit.com/r/worldnews+technology+business+finance+science+news+technews+economy/top/.json?t=hour&limit=16',
                    'https://www.reddit.com/r/worldnews+technology+business+finance+science+news+technews+economy/hot/.json?&t=day&limit=16',
                    'https://www.reddit.com/r/worldnews+technology+business+finance+science+news+technews+economy/hot/.json?&t=hour&limit=16']
                async.mapLimit(urls, 4, async function (url) { try { const response = await fetch(url); return response.json() } catch (err) { return {} } }, (err, results) => { response = normalizeRedditData(results); setLocalStorage("TopNews", response, 15 * 60000); resolve(response) })
            } else {
                resolve(getLocalStorage("TopNews"));
            }
        } catch (err) { reject(err) }
    })
}
function populate_Latest_Top(data) {   
    $(".content").html(``);
    try {
        $.each(data, function (k, v) {
            var { hostname } = new URL(v.link);
            let imgsrc = v.thumbnail ? v.thumbnail : ``
            var $listItem = $(`<div class="col">
            <div class="card h-100 shadow-sm border-0" style="cursor:pointer!important">
                <img src="${imgsrc}" loading="lazy" class="card-img-top border-0" alt="" style="max-height:150px;object-fit:cover;height:145px!important;" onerror='imgError(this)' >
                <div class="card-body">
                    <p class="small mb-0">${hostname}</p>
                    <p class="fw-bold text-dark">${v.title}</p>
                    <!--<p class="small">${v.excerpt}</p>-->
                </div>
            </div>
        </div>`);
            $listItem.on("click", function (e) {
                window.open(v.link);
            });
            $(".content").append($listItem);
        })
    } catch (err) {

    }
}
function populate_Latest_Top_List(data) {   
    $(".content").html(``);
    $(".listt").html(``);
    $(".content").parent().replaceWith(`<div class="row mt-2 justify-content-center">
    <div class="col-9"><ul class="list-group list-group-flush listt">
    </ul></div></div>`)
    // $(".content").html(``);
    // $(".content").html(` `);
    try {
        $.each(data, function (k, v) {
            var { hostname } = new URL(v.link);
            let imgsrc = v.thumbnail ? v.thumbnail : ``
            var $listItem = $(`                    
            <li class="list-group-item mb-1">
                    <span class="mb-0 mt-0 fw-bold">${v.title} - <a href="${v.link}" class="" target="_blank">${v.source}</a></span>                   
            </li>
            `);           
            $listItem.on("click", function (e) {
                window.open(v.link);
            });
            $(".listt").append($listItem);
        })
    } catch (err) {console.log(err)}
}

function populate_Latest_Top_Details(data) {   
    $(".content").html(``);
    $(".listt").html(``);
    $(".content").parent().replaceWith(`<div class="row mt-2 justify-content-center">
    <div class="col-9"><ul class="list-group list-group-flush listt">
    </ul></div></div>`)
    // $(".content").html(``);
    // $(".content").html(` `);
    try {
        $.each(data, function (k, v) {
            var { hostname } = new URL(v.link);
            let imgsrc = v.thumbnail ? v.thumbnail : ``
            var $listItem = $(`                    
            <li class="list-group-item mb-1">                                        
                <div class="d-flex gap-2 w-100 justify-content-start">
                <img src="${imgsrc}" alt="" width="84" height="84" class="flex-shrink-0 sqimg rounded" onerror='imgErrorloadicon(this,"${v.source}")' />
                    <div>          
                        <h6 class="mb-0 mt-0 fw-bold">${v.title}</h6> 
                        <p class="mb-0 mt-0 small text-yellow fw-bold"><a href="${v.link}" class="text-yellow underline" target="_blank">${v.source}</a></p> 
                    </div>
                    
                </div>
            </li>
            `);        
            $listItem.on("click", function (e) {
                window.open(v.link);
            });
            $(".listt").append($listItem);
        })
    } catch (err) {console.log(err)}
}

// Trending Searches
function getGoogleSearchTrends() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("GoogleSearchTrends")) {
                urls = ["https://trends.google.com/trends/api/dailytrends?hl=en-IN&geo=IN&ns=15",
                ]
                async.mapLimit(urls, 1, async function (url) {
                    try {
                        // const response = await fetch("https://sbcors.herokuapp.com/" + url)
                        const response = await fetch(url)
                        return response.text()
                    } catch (err) {
                        return ")]}',"
                    }
                }, (err, results) => {
                    // all = [];
                    arr = [];
                    results.forEach(item => {
                        arr.push(JSON.parse(item.replace(")]}',", "")))
                    })
                    // response = 	arr.filter((v,i,a)=>a.findIndex(t=>(t.title === v.title))===i)
                    setLocalStorage("GoogleSearchTrends", arr, 60 * 60000);
                    resolve(arr);
                })

            } else {
                resolve(getLocalStorage("GoogleSearchTrends"));
            }
        } catch (err) { reject(err) }
    })
}
function populateGoogleSearchTrends(data) {
    console.log(data)
    $(".content").html(``);
    var arr = [];
    $.each(data, function (k, v) {
        $.each(v.default.trendingSearchesDays, function (i, j) {
            $.each(j.trendingSearches, function (a, b) {
                arr.push({
                    "title": b.title,
                    "traffic": b.formattedTraffic,
                    "articles": b.articles,
                    "image": b.image.imageUrl,
                    "date": Date.parse(j.formattedDate),
                    "formattedDate": j.formattedDate

                })
            })

        })
    });
    arr = arr.sort(function (a, b) {
        return b.date - a.date;
    });
    $.each(arr, function (k, v) {
        let imgsrc = v.image ? `<img src="${v.image}" alt="" width="96" height="96" class="rounded sqimg d-flex justify-content-end" onerror='imgError(this)' />` : ``
        let article0imgsrc = v.articles[0].image ? v.articles[0].image.imageUrl : ``
        var $listItem = $(`<div class="col">
            <div class="card h-100 shadow-sm border-0" style="cursor:pointer!important">
                <img src="${article0imgsrc}" loading="lazy" class="card-img-top border-0" alt="" style="max-height:150px;object-fit:none" onerror='imgError(this)' >
                <div class="card-body">                    
                    <p class="fw-bold text-dark">${v.title.query}</p>
                    <p class="mt-0 mb-0 text-dark">${v.articles[0].snippet}</p>
                         <details>
                             <summary><span class="mt-0 ">Explore</span></summary>
                             <ul class="list-group list-group-flush mt-3 ms-3" id="${k}GoogleSearchTrends">
                             </ul> 
                         </details> 
                </div>
            </div>
        </div>`);
        $(".content").append($listItem);
        $.each(v.articles.slice(1), function (a, b) {
            let imgsrc1 = b.image ? b.image.imageUrl : ``
            var $listItem = $(
                `<div class="d-flex gap-2 w-100 justify-content-between mb-2">
                    <details>
                        <summary><span class="">${b.title}</span></summary>
                        <div class="d-flex gap-2 w-100 justify-content-between mb-2 mt-2">
                            <p class="small fw-bold">${b.snippet} <span class="text-muted"><a href="${b.url}" target="_blank" style="color:blue;text-decoration:underline">Read full article at ${b.source}</span></p>                                      
                        </div>                                                                           
                    </details>
                </div>`);
            $(`#${k}GoogleSearchTrends`).append($listItem);
        });
    })
}

// Trending Wiki
function getWikiData() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("WikiData")) {
                const start = Date.now()
                var MyDate = new Date();
                year = MyDate.getFullYear();
                month = ('0' + (MyDate.getMonth() + 1)).slice(-2);
                day = ('0' + (MyDate.getDate())).slice(-2);
                let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/featured/${year}/${month}/${day}`;
                urls = [url]
                async.mapLimit(urls, 1, async function (url) {
                    try {
                        const response = await fetch(url)
                        return response.json()
                    } catch (err) {
                        return {}
                    }

                }, (err, results) => {
                    if (err) { console.log(err); } else {
                        wiki = {}
                        arr = []
                        $.each(results[0].mostread.articles, function (k, v) {
                            arr.push({ title: v.displaytitle, thumbnail: v.thumbnail, extract: v.extract, description: v.description, views: v.views, link: v.content_urls.desktop.page });
                        });
                        wiki.mostread = arr;
                        otd = []
                        $.each(results[0].onthisday, function (k, v) {
                            pages = []
                            $.each(v.pages, function (i, j) {
                                let thumbnail = j.thumbnail ? j.thumbnail.source : ``
                                pages.push({
                                    title: j.displaytitle,
                                    thumbnail: thumbnail,
                                    extract: j.extract,
                                    description: j.description,
                                    link: j.content_urls.desktop.page
                                })
                            });
                            otd.push({
                                title: v.text,
                                year: v.year,
                                pages: pages
                            });
                        });
                        wiki.otd = otd;
                        wiki.image = {
                            "thumbnail": results[0].image.thumbnail.source,
                            "artist": results[0].image.artist.text,
                            "description": results[0].image.description.text,
                        }
                        var thumbnail = results[0].tfa.thumbnail ? results[0].tfa.thumbnail.source : ``
                        wiki.tfa = {
                            "title": results[0].tfa.displaytitle,
                            "thumbnail": thumbnail,
                            "content": results[0].tfa.extract,
                            "description": results[0].tfa.description.text,
                            "link": results[0].tfa.content_urls.desktop.page,
                        }
                        setLocalStorage("WikiData", wiki, 60 * 60000);
                        resolve(wiki)
                    }

                })
            } else {
                resolve(getLocalStorage("WikiData"));
            }
        } catch (err) { reject(err) }
    })
}
function populateMostRead(data) {
    console.log(data);
    $(".content").html(``);
    var mostread = data.mostread
    $.each(mostread, function (k, v) {
        let imgsrc = v.thumbnail ? v.thumbnail.source : ``
        var $listItem = $(`<div class="col">
            <div class="card h-100 shadow-sm border-0" style="cursor:pointer!important">
                <img src="${imgsrc}" loading="lazy" class="card-img-top border-0" alt="" style="max-height:150px;object-fit:cover" onerror='imgError(this)' >
                <div class="card-body">                    
                    <p class="fw-bold text-dark">${v.title}</p>
                    <p class="mt-0 mb-0 text-dark"></p>
                         <details>
                             <summary><span class="mt-0">${v.extract.slice(0,150)}...</span></summary>
                             ${v.extract.slice(150)}                            
                         </details> 
                </div>
            </div>
        </div>`);
        $(".content").append($listItem);
    });


}
function populateWiki(data) {
    console.log(data);
    $(".content").html(``);
    $(".content").append(`
    <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="mostread-tab" data-bs-toggle="tab" data-bs-target="#mostread" type="button" role="tab" aria-controls="mostread" aria-selected="true">Most Read</button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="featured-tab" data-bs-toggle="tab" data-bs-target="#featured" type="button" role="tab" aria-controls="featured" aria-selected="false">Featured</button>
        </li>     
        <li class="nav-item" role="presentation">
        <button class="nav-link" id="otd-tab" data-bs-toggle="tab" data-bs-target="#otd" type="button" role="tab" aria-controls="otd" aria-selected="false">OTD</button>
    </li>   
    </ul>
    <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="mostread" role="tabpanel" aria-labelledby="mostread-tab"></div>
        <div class="tab-pane fade" id="featured" role="tabpanel" aria-labelledby="featured-tab"></div> 
        <div class="tab-pane fade" id="otd" role="tabpanel" aria-labelledby="otd-tab"></div>       
    </div>
    `);
    var mostread = data.mostread
    $("#mostread").append(`<div class="row row-cols-1 row-cols-md-3">`)
    $.each(mostread, function (k, v) {
        let imgsrc = v.thumbnail ? v.thumbnail.source : ``
        var $listItem = $(`<div class="col">
            <div class="card h-100 shadow-sm border-0" style="cursor:pointer!important">
                <img src="${imgsrc}" loading="lazy" class="card-img-top border-0" alt="" style="max-height:150px;object-fit:none" onerror='imgError(this)' >
                <div class="card-body">                    
                    <p class="fw-bold text-dark">${v.title}</p>
                    <p class="mt-0 mb-0 text-dark">${v.extract}</p>
                         <details>
                             <summary><span class="mt-0 ">Explore</span></summary>
                             <ul class="list-group list-group-flush mt-3 ms-3" id="${k}GoogleSearchTrends">
                             </ul> 
                         </details> 
                </div>
            </div>
        </div>`);
        // var $listItem = $(`                    
        // <li class="list-group-item border-0 border-bottom mb-1" >                                        
        //     <div class="d-flex gap-2 w-100 justify-content-between">
        //         <div>
        //             <p class="mb-0 mt-1 small">Views: ${v.views.toLocaleString("en-GB")}</p>
        //             <p class="mb-0 mt-0 fw-bold">${v.title} <span class="small">(${v.description})</span></p>
        //         </div>
        //     </div>
        //     <div>
        //         <details>
        //             <summary><span class="smaller">Read more about ${v.title}</span></summary>
        //             <p class="mb-0 mt-1 small">${v.extract}</p>
        //             <p class="mb-0 mt-1 small"><a href="${v.link}" target="_blank">Read full article on Wikipedia</a></p>
        //         </details>
        //     </div>
        // </li>
        // `);
        $("#mostread").append($listItem);
    });
    $("#mostread").append(`</div>`);
    var image = data.image
    let imgsrc = image.thumbnail ? image.thumbnail : ``
    var $listItem = $(`                    
                    <li class="list-group-item  mt-4 mb-1">   
                        <div class="card" style="width:100%;">                            
                            <div class="card-body">
                                <p class="mt-0 fw-bold">${image.description}</p> 
                                <p class="mt-1 mb-0 small fw-bold">Artist: ${image.artist}</p>
                            </div>
                            <img src="${imgsrc}" class="card-img-top" alt="" onerror='imgError(this)' />                                   
                            </div>                            
                        </div>
                    </li>
                    `);
    $("#featured").append($listItem);
    var tfa = data.tfa
    let taimgsrc = tfa.thumbnail ? tfa.thumbnail : ``
    var $listItem = $(`                    
                    <li class="list-group-item mb-1">   
                        <div class="card mt-4" style="width:100%;">  
                            <div class="card-body"> 
                                <h5 class="mt-0 fw-bold">${tfa.title}</h5> 
                                <p class="mt-1 mb-0 small fw-bold">${tfa.content}</p>
                            </div> 
                            <img src="${taimgsrc}" class="card-img-top" alt="" onerror='imgError(this)' />
                            </div>
                        </div>
                    </li>
                    `);
    $("#featured").append($listItem);


    $.each(data.otd, function (k, v) {
        var details = ""
        $.each(v.pages, function (i, j) {
            details += `<div class="d-flex gap-2 w-100 justify-content-between my-1">
            <div>
                <details class="ms-4" style="cursor:pointer"><summary class="mb-0 mt-0">${j.title} (<small>${j.description}</small>)                          
                </summary>
                <p class="mb-0 mt-0 small">${j.extract}</p>  
                <p class="mb-0 mt-0 small"><a href="${j.link}" target="_blank">Read full article on Wikipedia</a></p>   
                </details>                                                        
            </div>           
        </div>`
        });
        var $listItem = $(`                    
        <li class="list-group-item border-bottom mb-1" >                                        
            <div class="d-flex gap-2 w-100 justify-content-between">
                <div>
                    <p class="mb-0 mt-1">${v.year}</p> 
                    <details class="top-details" style="cursor:pointer"><summary class="mb-0 mt-0 fw-bold">${v.title}             
                    </summary>
                        ${details}
                    </details>                                                        
                </div>
               
            </div>	
           
        </li>
        `);
        $("#otd").append($listItem);
    });
}

// Realtime Trends
function getRealtimeTrends() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("GoogleTrends")) {
                const start = Date.now()
                var param = "";
                if (country && language) {
                    param = `hl=${language}-${country}&tz=0&fi=0&fs=0&geo=${country}&ri=300&rs=20&sort=0`
                    urls = [
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=h`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=e`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=t`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=b`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=s`,
                        `https://trends.google.com/trends/api/realtimetrends?${param}&cat=m`,
                    ]
                } else {
                    urls = [
                        "https://trends.google.com/trends/api/realtimetrends?cat=h",
                        "https://trends.google.com/trends/api/realtimetrends?cat=e",
                        "https://trends.google.com/trends/api/realtimetrends?cat=t",
                        "https://trends.google.com/trends/api/realtimetrends?cat=b",
                        "https://trends.google.com/trends/api/realtimetrends?cat=s",
                        "https://trends.google.com/trends/api/realtimetrends?cat=m",
                    ]
                }
                async.mapLimit(urls, 6, async function (url) {
                    try {
                        const response = await fetch(url)
                        //const response = await fetch("https://sbcors.herokuapp.com/" + url)
                        return response.text()
                    } catch (err) {
                        return "{)]}'}"
                    }

                }, (err, results) => {
                    if (err) { console.log(err); }
                    else {
                        // all = [];
                        arr = [];
                        articles = []
                        for (index in results) {
                            try {
                                if (results[index]) {
                                    response = JSON.parse(results[index].replace(")]}'", ""));
                                    response.storySummaries.trendingStories.forEach(item => { arr.push(item) });
                                }
                            } catch (err) {
                                console.trace(err);
                            }
                        }
                        response = arr.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i)
                        setLocalStorage("GoogleTrends", response, 60 * 60000);
                        resolve(response);
                    };
                })

            } else {
                resolve(getLocalStorage("GoogleTrends"));
            }
        } catch (err) { reject(err) }
    })
}
function populateRealtimeTrends(data) {
    $(".content").html(``);
    $.each(data, function (k, v) {
        let imgsrc = v.image ? v.image.imgUrl : ``
        console.log(imgsrc);
        var $listItem = $(`<div class="col">
            <div class="card h-100 shadow-sm border-0" style="cursor:pointer!important">
                <img src="${imgsrc}" loading="lazy" class="card-img-top border-0" alt="" style="max-height:150px;object-fit:none;" onerror='imgError(this)' >
                <div class="card-body">                    
                    <p class="fw-bold text-dark">${v.title}</p>
                    <div>                                                                              
                        <details>
                            <summary class="mt-0 fw-bold">Explore</summary>
                            <ul class="list-group list-group-flush mt-3" id="${k}googleTrends">
                            </ul> 
                        </details>                   
                    </div>
                </div>
            </div>
        </div>`);

        $(".content").append($listItem);
        $.each(v.articles, function (a, b) {

            var $listItem = $(
                `<div class="d-flex gap-2 w-100 justify-content-between mb-2 ms-2">
                            <details>
                                <summary><span class="">${b.articleTitle}</span></summary>
                                <div class="d-flex gap-2 w-100 justify-content-between mt-2">
                                    <p class="small fw-bold">${b.snippet} <span class="text-muted"><a href="${b.url}" target="_blank" style="color:blue;text-decoration:underline">Read full article at ${b.source}</span></p>                                      
                                </div>                                                                           
                             </details> 
                            </div>`);
            $(`#${k}googleTrends`).append($listItem);
        });
    })
}


async function fetchURL(url) {
    const response = await fetch(url);
    const text = await response.text();
    try {
        const data = JSON.parse(text);
        return { success: 1, urlfetched: url, data: data }
    } catch (err) {
        return { success: 0, urlfetched: url, error: err, response: text }
    }
}

function imgErrorloadicon(image, hostname) {
    $(image).hide();
}

//Trending Hashtags
function getTrendingHashtags() {
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("Hashtags")) {
                const start = Date.now()
                var MyDate = new Date();
                year = MyDate.getFullYear();
                month = ('0' + (MyDate.getMonth() + 1)).slice(-2);
                day = ('0' + (MyDate.getDate())).slice(-2);
                urls = [`https://api.exportdata.io/trends/locations/worldwide?date=${year}-${month}-${day}`,
                `https://api.exportdata.io/trends/locations/in?date=${year}-${month}-${day}`,
                ]
                async.mapLimit(urls, 4, async function (url) {
                    try {
                        const response = await fetch(url)
                        return response.json()
                    } catch (err) {
                        console.log(err.response);
                    }

                }, (err, results) => {
                    if (err) { console.log(err); }
                    else {
                        twitterTrends = {}
                        trends = []
                        for (index in results) {
                            for (i in results[index]) {
                                var item_index = trends.findIndex(x => x.name == results[index][i].name);
                                if (item_index == -1) {
                                    trends.push({ name: results[index][i].name, volume: results[index][i].tweet_volume })
                                }
                            }
                        }
                        trends = trends.sort(function (a, b) {
                            return b.volume - a.volume;
                        });
                        const stop = Date.now()
                        console.log(`Time Taken to execute hashtags = ${(stop - start) / 1000} seconds`);
                        setLocalStorage("Hashtags", trends, 15 * 60000);
                        resolve(trends);
                    };
                })
            } else {
                resolve(getLocalStorage("Hashtags"));
            }

        } catch (err) { reject(err) }
    })
}
function populateHashtags(data) {
    $(".scroller").html(``);
    var $listItem = $(`<h4 class="mt-4 fw-bold ms-2">Trending Hashtags</h4>`);
    $(".scroller").append($listItem);
    $.each(data, function (k, v) {
        let link = v.name.includes("#") ? `%23${v.name.replace("#", "")}` : v.name
        var $listItem = $(` 
            <li class="list-group-item mb-1">
                <h6 class="mb-0 mt-0">${v.name}</h6>
                <p class=" fw-bold mb-0"><span class="text-yellow">${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(v.volume)}</span></p>
                <p><a href="https://twitter.com/search?q=${link}&vertical=trends" target="_blank">See on twitter</a>
            </li>
            `);
        $(".scroller").append($listItem);
    })
}

//Get Top Wordpress
function getwpTop() {
    var n = 5;
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("wpTop")) {
                urls = [
                    `https://variety.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://time.com//wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://thewire.in/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    //`https://www.thestatesman.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://www.hollywoodreporter.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://deadline.com//wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://techcrunch.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://observer.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://metro.co.uk/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://thesun.co.uk/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    "https://www.siasat.com/wp-json/wp/v2/posts?per_page=5&context=view",
                    `https://themarginalian.org/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://public-api.wordpress.com/rest/v1.2/sites/197693856/posts/?&number=${n}`,
                    `https://public-api.wordpress.com/rest/v1.2/sites/26599698/posts/?&number=${n}`,
                    `https://public-api.wordpress.com/rest/v1.2/sites/198147347/posts/?&number=${n}`,
                    `https://public-api.wordpress.com/rest/v1.2/sites/190074382/posts/?&number=${n}`,
                    `https://public-api.wordpress.com/rest/v1.2/sites/176892389/posts/?&number=${n}`,
                    `https://public-api.wordpress.com/rest/v1.2/sites/126020344/posts/?&number=${n}`,
                    `https://public-api.wordpress.com/rest/v1.2/sites/136451602/posts/?&number=${n}`,
                    `https://public-api.wordpress.com/rest/v1.2/sites/177646860/posts/?&number=${n}`,
                    `https://newstatesman.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://revealnews.org/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://bylinetimes.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://www.technologyreview.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://thewalrus.ca/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://liberalcurrents.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    `https://thebaffler.com/wp-json/wp/v2/posts?per_page=${n}&context=view`,
                    //`https://public-api.wordpress.com/rest/v1.2/sites/189127649/posts/?&number=${n}`,
                ]
                async.map(urls, async function (url) {
                    try {
                        const response = await fetch(url)
                        return response.json()
                    } catch (err) {
                        return {}
                    }

                }, (err, results) => {
                    if (err) { console.log(err); } else {
                        arr = [];
                        console.log(results);
                        for (index in results) {
                            if (results[index].posts) {
                                results[index].posts.forEach(item => {
                                    arr.push({
                                        "title": item.title,
                                        "date": `${new Date(item.date.toString()).toLocaleString()}`,
                                        "link": item.URL,
                                        "content": item.content,
                                        "excerpt": item.excerpt,
                                        "media": item.featured_image,
                                        "created": Date.parse(item.date)
                                    })
                                });
                            } else {
                                results[index].forEach(item => {
                                    arr.push({
                                        "title": item.title.rendered,
                                        "date": `${new Date(item.date.toString()).toLocaleString()}`,
                                        "link": item.link,
                                        "content": item.content.rendered,
                                        "excerpt": item.excerpt.rendered,
                                        "media": item.jetpack_featured_media_url,
                                        "created": Date.parse(item.date),
                                    })

                                });
                            }

                        }
                        arrr = arr.sort(function (a, b) {
                            return b.created - a.created;
                        });
                        setLocalStorage("wpTop", arrr, 60 * 60000);
                        resolve(arrr);
                    }

                })
            } else {
                resolve(getLocalStorage("wpTop"));
            }

        } catch (err) { reject(err) }
    })


}
function populatewpTop(data) {
    $(".heading").html("Top Wordpress Sites")
    $(".content").html("");
    var count = 0
    $.each(data, function (k, v) {
        try {
            var { hostname } = new URL(v.link);
            let imgsrc = v.media ? v.media : ``
            var $listItem = $(`                    
            <li class="list-group-item mb-1">  
                <details>
                    <summary><span class="mb-0 mt-0 fw-bold">${v.title} - <a href="${v.link}" class="" target="_blank">${hostname}</a></span></summary>
                    ${v.excerpt}
                    </details>
            </li>
            `);
            //var $listItem = $(`                    
            //<li class="list-group-item mb-1">                                        
            //    <div class="d-flex gap-2 w-100 justify-content-between">
            //        <div>      
            //            <p class="small mb-0"><span class="text-yellow">${hostname} | ${v.date}</span></p>
            //            <h6 class="mt-0 fw-bold">${v.title}</h6>                       
            //        </div>                   
            //    </div>
            //    <p class="mt-1 small">${v.excerpt}</p> 
            //    <div>
            //        <details>
            //            <summary>Read Full article</summary>
            //        </details>  
            //    </div>
            //</li>
            //`);
            $(".content").append($listItem);
        } catch (err) {
            console.log(v.link, err);
        }
    });
}

//getRSS();
//Get RSS
function getRSS() {
    var n = 5;
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("RSS")) {
                urls = [
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Ahindustantimes.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Alivemint.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Amoneycontrol.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Anews18.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Aindiatimes.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Andtv.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Aindianexpress.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Aoutlookindia.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Abusiness-standard.com)%2Bwhen%3A3h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    //`https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Ahindustantimes.com)%2Bwhen%3A1h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,
                    //`https://feedly.com/v3/feeds/feed%2Fhttps%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3D(site%3Ahindustantimes.com)%2Bwhen%3A1h%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%3Aen?numRecentEntries=3&ck=1655538362595&ct=feedly.desktop&cv=31.0.1618`,

                ]
                async.map(urls, async function (url) {
                    try {
                        const response = await fetch(url)
                        return response.json()
                    } catch (err) {
                        return {}
                    }

                }, (err, results) => {
                    if (err) { console.log(err); } else {
                        console.log(results);
                        arr = [];
                        for (index in results) {
                            if (results[index].recentEntries.length > 0) {
                                results[index].recentEntries.forEach(item => {
                                    arr.push({
                                        "title": item.title,
                                        "link": item.originId,
                                        "content": item.summary.content,
                                        "published": item.published
                                    })
                                });
                            }
                            arrr = arr.sort(function (a, b) {
                                return b.published - a.published;
                            });

                        }
                        console.log(arrr);
                        setLocalStorage("RSS", arrr, 60 * 60000);
                        resolve(arrr);
                    }

                })
            } else {
                resolve(getLocalStorage("RSS"));
            }

        } catch (err) { reject(err) }
    })
}
function populateRSS(data) {
    $(".scroller").html("");
    var count = 0
    $.each(data, function (k, v) {
        try {
            var { hostname } = new URL(v.link);
            var $listItem = $(`                    
            <li class="list-group-item mb-1">  
                <details>
                    <summary><span class="mb-0 mt-0 fw-bold">${v.title} - <a href="${v.link}" class="" target="_blank">${hostname}</a></span></summary>
                    ${v.content}
                    </details>
            </li>
            `);
            $(".scroller").append($listItem);
        } catch (err) {
            console.log(v.link, err);
        }
    });
}

function getHomePageArticles() {
    const numArticle = 1;
    const start = Date.now();
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("homepage")) {
                urls = [
                    //`https://telanganatoday.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://detailed.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://thewire.in/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://techcrunch.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://www.hollywoodreporter.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://time.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://wired.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://observer.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://variety.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://www.thesun.co.uk/wp-json/wp/v2/posts/?per_page=${numArticle}&context=view`,
                    `https://o.canada.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://9to5mac.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://metro.co.uk/wp-json/wp/v2/posts?context=view&per_page=${numArticle}&context=view`,
                    //`https://thehustle.co/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://a16z.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://www.dancemagazine.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://stereogum.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://rollingstone.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://www.foreignpolicy.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://www.technologyreview.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://reallifemag.com/wp-json/wp/v2/posts/?per_page=${numArticle}&context=view`,
                    //`https://popsci.com/wp-json/wp/v2/posts/?per_page=${numArticle}&context=view`,
                    //`https://harpers.org/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    //`https://www.historyextra.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://www.ask.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://motherjones.com/wp-json/wp/v2/posts?per_page=1&context=view`,
                    `https://boingboing.net/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://www.interviewmagazine.com/wp-json/wp/v2/posts?per_page=${numArticle}&context=view`,
                    `https://public-api.wordpress.com/rest/v1/batch?http_envelope=1&urls[]=/sites/80495929/posts?number=1&urls[]=/sites/176892389/posts?number=1&urls[]=/sites/171782886/posts?number=1&urls[]=/sites/126020344/posts?number=1&urls[]=/sites/197693856/posts?number=1urls[]=/sites/150998827/posts?number=1&urls[]=/sites/150893645/posts?number=1`
                ]
                async.mapLimit(urls, 30, async function (url) {
                    try {
                        const response = await fetch(url)
                        return response.json()
                    } catch (err) {
                        console.trace(err);
                    }

                }, (err, results) => {
                    if (err) { console.log(err); console.log(results); }
                    arr = []
                    for (index in results) {
                        if (results[index]) {
                            if (results[index].body) {
                                if (results[index].code == 200) {
                                    for (const [key, value] of Object.entries(results[index].body)) {
                                        console.log(key, value);
                                        $.each(value.posts, function (k, item) {
                                            arr.push({
                                                "title": item.title,
                                                "date": `${new Date(item.date.toString()).toLocaleString()}`,
                                                "link": item.URL,
                                                "content": item.content,
                                                "excerpt": item.excerpt,
                                                "media": item.featured_image,
                                                "created": Date.parse(item.date)
                                            })
                                        })
                                    }
                                }
                            }
                            else {
                                results[index].forEach(item => {
                                    arr.push({
                                        "title": item.title.rendered,
                                        "date": `${new Date(item.date.toString()).toLocaleString()}`,
                                        "link": item.link,
                                        "content": item.content.rendered,
                                        "excerpt": item.excerpt.rendered,
                                        "media": item.jetpack_featured_media_url,
                                        "created": Date.parse(item.date),
                                    })

                                });
                            }
                        }
                    }
                    arrr = arr.sort(function (a, b) {
                        return b.created - a.created;
                    });
                    const stop = Date.now();
                    console.log(`Time Taken to execute = ${(stop - start) / 1000} seconds`);
                    setLocalStorage("homepage", arrr, 15 * 60000);
                    resolve(arrr);
                })

            } else {
                resolve(getLocalStorage("homepage"));
            }
        } catch (err) { reject(err) }
    })
}
function populateHomePage(data) {
    $(".content").html("");
    $.each(data, function (k, v) {
        try {
            var { hostname } = new URL(v.link);
            // let imgsrc = v.media ? v.media : `https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.wp.com%2Fpieceartura.pl%2Fwp-content%2Fuploads%2Fwoocommerce-placeholder.png%3Ffit%3D960%252C960%26ssl%3D1&f=1&nofb=1`
            var $listItem = $(`<div class="col">
                <div class="card h-100 shadow-sm border-0 bg-light" style="cursor:pointer!important">
                    <img src="${v.media}" loading="lazy" class="card-img-top border-0" alt="" style="max-height:150px;object-fit:cover;height:145px!important;" onerror='imgError(this)' >
                    <div class="card-body">
                        <p class="small mb-0">${hostname}</p>
                        <p class="fw-bold">${v.title}</p>
                        <!--<p class="small">${v.excerpt}</p>-->
                    </div>
                </div>
            </div>`);
            $listItem.on("click", function (e) {
                // console.log(item);
                $("#modalTitle").html(``);
                $("#modalBody").html(``);
                $('#myModal').on('shown.bs.modal', function () {
                    $("#modalTitle").html(`<span class="fw-bold">${v.title}</span>`);
                    $("#modalBody").html(v.content);
                    $('#myModal img').each(function () {
                        $(this).removeAttr('style');
                        $(this).removeAttr('class');
                        $(this).removeAttr('width');
                        $(this).removeAttr('height');
                    });
                })
                $('#myModal').modal('show');
            });
            $(".content").append($listItem);
        } catch (err) {
            console.log(v.link, err);
        }
    });
}

function imgError(image) {
   //  $(image).hide();    
    $(image).attr("src", `placeholder.png`);
    // $(image).unwrap();
    //$(image).parent().remove();
}


//getRSS();
//Get RSS
function getCustomRSS() {
    console.log("getCustomRSS")
    var n = 2;
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("CustomRSS")) {
                urls = [
                    `https://feedly.com/v3/streams/contents?streamId=feed/https://www.theguardian.com/international/rss&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655540245574&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fnewsrss.bbc.co.uk%2Frss%2Fnewsonline_world_edition%2Ffront_page%2Frss.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655540982245&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Frss.cnn.com%2Frss%2Fcnn_topstories.rss&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655541106236&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.nytimes.com%2Fservices%2Fxml%2Frss%2Fnyt%2FHomePage.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655541197603&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.npr.org%2Frss%2Frss.php%3Fid%3D1001&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655541582006&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.dnaindia.com%2Fsyndication%2Frss%2CcatID-0.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542362201&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds.feedburner.com%2FNDTV-LatestNews&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542400483&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.firstpost.com%2Findia%2Ffeed&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542448625&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttps%3A%2F%2Fthewire.in%2Frss&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542489513&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.indiatvnews.com%2Frssfeed%2Ftopstory_news.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542539974&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.siasat.com%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542626222&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffreepressjournal.in%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542705713&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.theverge.com%2Frss%2Ffull.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542765327&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds.feedburner.com%2FTechcrunch&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542795296&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds.gawker.com%2Fgizmodo%2Ffull&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542817127&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.engadget.com%2Frss-full.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542841725&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds.arstechnica.com%2Farstechnica%2Findex%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542873729&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.tmz.com%2Frss.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655542952759&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.filmfare.com%2Ffeeds%2Ffeeds.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543053012&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.koimoi.com%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543076262&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds.feedburner.com%2Fmissmalini&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543117700&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.pinkvilla.com%2Frss.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543140631&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.bollywoodhungama.com%2Frss%2Ffeatures.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543171226&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.cricinfo.com%2Frss%2Fcontent%2Fstory%2Ffeeds%2F0.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543204984&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds.politico.com%2Fpolitico%2Frss%2Fpoliticopicks&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543267978&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffivethirtyeight.com%2Ffeatures%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543306830&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Ffeeds2.feedburner.com%2Fbusinessinsider&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543370187&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.bleepingcomputer.com%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543461711&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.inc.com%2Frss.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543680500&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttps%3A%2F%2Ftelanganatoday.com%2Ffeed&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543807730&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Frss.jagran.com%2Fnaidunia%2Fmadhya-pradesh%2Findore.xml&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543845969&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttps%3A%2F%2Fwww.bhaskar.com%2Frss-feed%2F1701%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655543873695&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttps%3A%2F%2Fwww.newstatesman.com%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655787457433&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttps%3A%2F%2Frevealnews.org%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655787689881&ct=feedly.desktop&cv=31.0.1618`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttps%3A%2F%2Fwww.technologyreview.com%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655888140071&ct=feedly.desktop&cv=31.0.1620`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.fromquarkstoquasars.com%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1655888213134&ct=feedly.desktop&cv=31.0.1620`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fthewalrus.ca%2Ffeed%2F&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1656002394080&ct=feedly.desktop&cv=31.0.1621`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.thebaffler.com%2Fblog%2Frss&count=${n}&ranked=newest&similar=true&findUrlDuplicates=true&ck=1656002439204&ct=feedly.desktop&cv=31.0.1621`,
                    `https://feedly.com/v3/streams/contents?streamId=feed%2Fhttp%3A%2F%2Fwww.newyorker.com%2Ffeed%2Fnews&count=9&ranked=newest&similar=true&findUrlDuplicates=true&ck=1656002789764&ct=feedly.desktop&cv=31.0.1621`,
                ]
                async.map(urls, async function (url) {
                    try {
                        const response = await fetch(url)
                        return response.json()
                    } catch (err) {
                        return {}
                    }

                }, (err, results) => {
                    if (err) { console.log(err); } else {
                        console.log(results);
                        arr = [];
                        for (index in results) {
                            console.log(results[index].title)
                            if (results[index].items) {
                                results[index].items.forEach(item => {
                                    let title = item.title ? item.title : ``;
                                    let link = item.originId ? item.originId : ``;
                                    let content = item.summary ? item.summary.content : ``
                                    let published = item.published ? item.published : ``
                                    let media = item.visual ? item.visual.url : ``
                                    arr.push({
                                        "title": title,
                                        "link": link,
                                        "content": content,
                                        "published": published,
                                        "media": media
                                    })
                                });
                            }
                            arrr = arr.sort(function (a, b) {
                                return b.published - a.published;
                            });

                        }
                        console.log(arrr);
                        setLocalStorage("CustomRSS", arrr, 60 * 60000);
                        resolve(arrr);
                    }

                })
            } else {
                resolve(getLocalStorage("CustomRSS"));
            }

        } catch (err) { reject(err) }
    })
}
function populateCustomRSS(data) {
    console.log(data);
    $(".content").html("");
    $.each(data, function (k, v) {
        try {
            var { hostname } = new URL(v.link);
            // let imgsrc = v.media ? v.media : `https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi1.wp.com%2Fpieceartura.pl%2Fwp-content%2Fuploads%2Fwoocommerce-placeholder.png%3Ffit%3D960%252C960%26ssl%3D1&f=1&nofb=1`
            var $listItem = $(`<div class="col">
                <div class="card h-100 shadow-sm border-0" style="cursor:pointer!important">
                    <img src="${v.media}" loading="lazy" class="card-img-top border-0" alt="" style="max-height:150px;object-fit:cover;height:145px!important;" onerror='imgError(this)' >
                    <div class="card-body">
                        <p class="small mb-0">${hostname}</p>
                        <p class="fw-bold text-dark">${v.title}</p>
                        <!--<p class="small">${v.excerpt}</p>-->
                    </div>
                </div>
            </div>`);
            $listItem.on("click", function (e) {
                window.open(v.link);
            });
            $(".content").append($listItem);
        } catch (err) {
            console.log(v.link, err);
        }
    });
}


function searchNews() {
    var input, filter;
    input = document.getElementById('searchBox');
    filter = input.value.toUpperCase();
    console.log(filter);
    urls = [`https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&sort=datedesc&format=json&maxrecords=100&query=sourcelang:eng%20${filter}`];
    if (filter.length > 3) {
        async.mapLimit(urls, 1, async function (url) {
            try {
                const response = await fetch(url);
                return response.json()
            }
            catch (err) {
                return {}
            }
        }, (err, results) => {
            response = normalizeGDELT(results);
            populate_Latest_Top(response);
        })
    }   

}


// Trending Youtube
function getYTTrends(){
    return new Promise((resolve, reject) => {
        try {
            if (!getLocalStorage("CustomRSS")){
                const start = Date.now()
                urls = ["https://kworb.net/youtube/","https://kworb.net/youtube/trending.html"]
                async.mapLimit(urls, 2, async function (url) {
                    try {
                        const response = await fetch(url, {
                            method: 'get',
                            headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36' }
                        })
                        return response.text();
                    } catch (err) {
                        return ""
                    }
    
                }, (err, results) => {
                    if (err) { console.log(err);  }
                    else {
                        const stop = Date.now()
                        console.log(`Time Taken to execute YT = ${(stop - start) / 1000} seconds`);
                        str = getFromBetween.get(results[0], '<table', '</table>');
                        YT={}                   
                        YT.mostviewed = getFromBetween.get(results[0], 'href="video/', '.html">');
                        YT.trending = getFromBetween.get(results[1], 'href="/youtube/trending/video/', '.html">');       
                        setLocalStorage("Youtube", arrr, 60 * 60000);             
                        resolve(YT);
                    };
                })
            }
            else{
                resolve(getLocalStorage("Youtube"));
            }          

        } catch (err) { reject(err) }
    })
}
