// ==UserScript==
// @name        Message Flags
// @name:ru     Флаги сообщений
// @namespace   2ch_hk
// @description    Adds OS and browser flags to messages on 2ch.hk
// @description:ru Добавляет флаги ОС и браузера в сообщения на 2ch.hk
// @include      http://2ch.hk/s/*
// @include      http://2ch.pm/s/*
// @include      https://2ch.hk/s/*
// @include      https://2ch.pm/s/*
// @version     v1.6.8
// @downloadURL https://github.com/AlsaAsksMiley/2ch-ua-flagger/raw/master/2ch-s-ua.user.js
// @updateURL   https://github.com/AlsaAsksMiley/2ch-ua-flagger/raw/master/2ch-s-ua.meta.js
// @grant       none
// ==/UserScript==
function log(content) {
    console.log("[MessageFlagsUserscript]: " + content.toString());
}

Flagger2ch = function () {
    this.os_list = {
        "Microsoft Windows 95": "Windows9X",
        "Microsoft Windows 98": "Windows9X",
        "Microsoft Windows 2000": "Windows9X",
        "Microsoft Windows XP": "WindowsXP",
        "Microsoft Windows Server 2003": "WindowsXP",
        "Microsoft Windows Vista": "WindowsVista",
        "Microsoft Windows 7": "Windows7",
        "Microsoft Windows 8": "Windows8",
        "Microsoft Windows 8.1": "Windows8",
        "Microsoft Windows 10": "Windows10",
        "Microsoft Windows Phone": "WindowsPhone",
        "Linux": "GNULinux",
        "Debian Linux": "DebianLinux",
        "Ubuntu Linux": "UbuntuLinux",
        "Arch Linux": "ArchLinux",
        "Fedora Linux": "FedoraLinux",
        "CentOS Linux": "CentOS",
        "BSD": "FreeBSD",
        "Apple Mac": "OSXMavericks",
        "Apple GayPad": "IOS",
        "Apple GayPhone": "IOS",
        "Haiku": "Haiku",
        "Google Android": "Android",
        "OS/2": "OS2",
        "Oracle Sun": "Solaris",
        "openSUSE": "OpenSUSE"
    };
    this.browser_list = {
        "Firefox based": "Firefox",
        "Iceweasel": "Iceweasel",
        "Chromium based": "Chromium",
        "New Opera": "OperaBlink",
        "Old Opera": "OperaPresto",
        "Vivaldi": "Vivaldi",
        "GoogleChrome": "Google Chrome",
        "Яндекс браузер": "YandexBrowser",
        "Internet Explorer": "IEModern",
        "Microsoft Edge": "MSEdge",
        "Safari": "Safari",
        "Mobile Safari": "Safari",
        "W3M": "W3M",
        "Lynx": "Lynx",
        "Web+": "WebPositive",
        "UCBrowser": "UCBrowser",
        "UC Browser": "UCBrowser",
        "Palemoon": "Palemoon",
        "QupZilla": "Qupzilla",
        "SeaMonkey": "SeaMonkey",
        "Midori": "Midori",
        "konqueror": "Konqueror",
        "Konqueror": "Konqueror", // На случай, если переименуют
        "Epiphany": "Epiphany",
        "Leechcraft": "Leechcraft",
        "Спутник": "Sputnik",
        "Links": "Links",
        "ELinks": "ELinks",
        "K-Meleon": "KMeleon",
        "Амиго": "Amigo",
        "Brave": "Brave"
    };
    this.showIcons = this.checkConfig();
    this.cssData =
            ".icons-inv {\n\
display: none;}\n\
.flagger-gen img {\n\
vertical-align: -3px;\
}\
.ua-flagger-panel {\n\
position: fixed;\n\
right: 0;\n\
bottom: 0;\n\
height: 25px;\n\
z-index: 9999;\n\
background-color: #777;\n\
border-radius: 10px 0px 0px;}\n\
.ua-flagger-btns {\n\
display: inline-block;\n\
padding: 0px 0px 0px 2px;\n\
margin: 0px;\n\
height: 25px;}\n\
#flagger-switch {\n\
width: 25px !important;\n\
height: 25px !important;\n\
display: inline-block;\n\
border: none !important;\n\
list-style-position: inside;}\n\
.flagger-ua-a {\n\
display: block;\n\
border: none !important;\n\
width: 25px !important;\n\
height: 25px !important;\n\
}\n\
#flagger-switch a, #flagger-switch a:hover {\n\
background-image: url(\"data:image/png;base64,"
            + this.flags_data.tech["ION"].replace(/\\/g, "")
            + "\");}\
#flagger-switch.off a {\n\
background-image: url(\"data:image/png;base64,"
            + this.flags_data.tech["IOFF"].replace(/\\/g, "")
            + "\");}";
};

Flagger2ch.prototype.init = function () {
    this.patch_posts(document);
    this.attachDOMObserver();
    document.onreadystatechange = function () {
        if (document.readyState === "complete") {
            flagger2ch.installSwitch();
        }
    };
    log("Flagger initialized");
};

Flagger2ch.prototype.checkConfig = function () {
    if ((mt = document.cookie.match(/fl2ch\.disp\_fl\=(\d+)/i)) && (parseInt(mt[1]) == 0)) {
        return false;
    }
    return true;
};

Flagger2ch.prototype.setConfig = function (state) {
    if (/fl2ch\.disp\_fl\=\d+/i.test(document.cookie)) {
        document.cookie = "fl2ch.disp_fl=\"\"; expires=" + new Date(0).toUTCString();
    }
    document.cookie = "fl2ch.disp_fl=" + (state ? "1" : "0") + "; path=/";
    this.showIcons = state;
};

Flagger2ch.prototype.gen_image_node = function (type, value) {
    var img_node = document.createElement("img");
    img_node.setAttribute("hspace", "3");
    img_node.setAttribute("border", "0");
    type = value !== "Неизвестно" ? type : -1;
    switch (type) {
        case 0:
            img_node.setAttribute("src", "data:image/png;base64," + this.flags_data.os[this.os_list[value]]);
            img_node.setAttribute("title", value);
            break;
        case 1:
            img_node.setAttribute("src", "data:image/png;base64," + this.flags_data.browser[this.browser_list[value]]);
            img_node.setAttribute("title", value);
            break;
        default :
            img_node = undefined;
    }
    return img_node;
};

Flagger2ch.prototype.patch_posts = function (target) {
    var thread_posts = target.querySelectorAll(".post-details");
    for (post = 0; post < thread_posts.length; post++) {
        this.patch_post(thread_posts.item(post));
    }
};

Flagger2ch.prototype.patch_post = function (post) {
    try {
        v = post.querySelector(".ananimas span") || post.querySelector(".post-email span");
        flag_data = v.lastChild.nodeValue;
    } catch (e) {
        flag_data = undefined;
    }
    if (flag_data) {
        ua_data = flag_data.replace(/[\(\)]/ig, "").split(":", 2);
        //log("Found flag data: OS:" + ua_data[0].trim() + ", Browser:" + ua_data[1].trim());
        flags_node = document.createElement("span");
        flags_node.classList.add("post-icon");
        flags_node.classList.add("flagger-gen");
        if (!this.showIcons) {
            flags_node.classList.add("icons-inv");
        }
        os_flag = this.gen_image_node(0, ua_data[0].trim());
        browser_flag = this.gen_image_node(1, ua_data[1].trim());
        if (os_flag)
            flags_node.appendChild(os_flag);
        if (browser_flag)
            flags_node.appendChild(browser_flag);
        anchor_span = post
                .querySelector(".posttime-reflink") ||
                post
                .querySelector(".posttime");
        post
                .insertBefore(flags_node, anchor_span);
        (post.querySelector(".ananimas") || post.querySelector(".post-email"))
                .removeChild(
                        (post.querySelector(".ananimas") || post.querySelector(".post-email"))
                        .querySelector("span"));
        (post.querySelector(".ananimas") || post.querySelector(".post-email"))
                .innerHTML = (post.querySelector(".ananimas") || post.querySelector(".post-email")).innerHTML.trim().replace(/\&nbsp\;/ig, "");
    }
};

Flagger2ch.prototype.attachDOMObserver = function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    //var targetNode = document.querySelector(".thread").parentNode;
    var targetNode = document.querySelector(".posts");
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList") {
                for (n = 0; n < mutation.addedNodes.length; n++) {
                    if(mutation.addedNodes.item(n).tagName === "FORM") {
                        log("Added new form");
                    }
                    var classTest = undefined;
                    try {
                        if (/post\-details.*/.test(mutation.addedNodes.item(n).id)) {
                            // Работает в треде
                            classTest = mutation.addedNodes.item(n);
                        } else {
                            // Работает в списке тредов
                            classTest = undefined;
                            flagger2ch.patch_posts(mutation.addedNodes.item(n));
                        }
                    } catch (e) {
                        classTest = undefined;
                    }
                    if (classTest) {
                        flagger2ch.patch_post(classTest);
                    }
                }
            }
        });
    });
    observer.observe(targetNode, {childList: true, subtree: true});
    log("MutationObserver attached");
};

Flagger2ch.prototype.installSwitch = function () {
    styleData = document.createElement("style");
    styleData.setAttribute("type", "text/css");
    styleData.innerHTML = this.cssData;
    document.head.appendChild(styleData);
    var attachPoint = undefined;
    if (document.getElementById("de-panel-btns") || document.getElementById("de-panel-buttons")) {
        attachPoint = document.getElementById("de-panel-btns") || document.getElementById("de-panel-buttons");
    } else {
        switchPanel = document.createElement("div");
        switchPanel.setAttribute("class", "ua-flagger-panel");
        //switchPanel.setAttribute("style", "");
        aList = document.createElement("ul");
        aList.setAttribute("class", "ua-flagger-btns");
        //aList.setAttribute("style", "");
        switchPanel.appendChild(aList);
        document.body.appendChild(switchPanel);
        attachPoint = aList;
    }
    var liButton = document.createElement("li");
    liButton.setAttribute("id", "flagger-switch");
    //liButton.setAttribute("style", "");
    liButton.appendChild(document.createElement("a"));
    liButton.lastChild.classList.add("flagger-ua-a");
    liButton.lastChild.classList.add("de-abtn");
    if (!this.showIcons) {
        liButton.setAttribute("class", "off");
    }
    //liButton.lastChild.setAttribute("style", "");
    if (attachPoint.firstChild)
        attachPoint.insertBefore(liButton, attachPoint.firstChild);
    else
        attachPoint.appendChild(liButton);
    liButton.addEventListener("click", flagger2ch.toggleVisibility);
};

Flagger2ch.prototype.toggleVisibility = function () {
    var postList = document.querySelectorAll(".post-icon.flagger-gen");
    if (flagger2ch.showIcons) {
        flagger2ch.setConfig(false);
        document.querySelector("#flagger-switch").classList.add("off");
    } else {
        flagger2ch.setConfig(true);
        document.querySelector("#flagger-switch").classList.remove("off");
    }
    for (i = 0; i < postList.length; i++) {
        flagger2ch.showIcons?postList.item(i).classList.remove("icons-inv"):postList.item(i).classList.add("icons-inv");
    }
};

Flagger2ch.prototype.flags_data = {
    os: {
        "OpenSUSE":
"iVBORw0KGgoAAAANSUhEUgAAABwAAAAQCAYAAAFyyC95AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABTVJREFUeNpiYIACc1MLExDN2N3e16Ed\
KlC++8ESBhNZRwaAAGIGieZlFSR9+Pj+G+P776/+1x4KZFAV1WcACCBGkMz7f0//\
N++LhxnD8O//PwYXhUgGBl9v//B77y//7z+T8f/6jWsPtLW1rU+fPHMGpAgggOBI\
U0NLA2Q2shijgICAYMRy9XdcrLxwQSMJZwZ/7VQGpuCliu9yjPsZ/oPhP6DUf4Zb\
708zfHj67R1D+X6v/08+3f5/4uipcyBdn/+9+Q8zASCAGJHt2LBm0ypVd4HQ1Ren\
MLz99gIsxsPGz2Cl6MVw/cUZBn1pawYTQe+/xtrmahBv/n/yv2ZXOFghOzMn1Jj/\
UHMhlnCy8DCYS3kxfPn9kUFX0pyB4eSx0yeqDgT8L9rj8v/Lr4//J53J/1+42+n/\
i2evXsbFJOQee7Hh/+o7Pf/Z2NhFpCSltIBmMMOduGDuwtU3vhz7f+b99v9rV63b\
wUAEAAggZnQBJiZmZn/fQO+ggBAnKUlpuefPn73U1NLUevfu3Ye/f//+wQgcI0Mj\
o4PH95/a8GAi87knBxl+//3FwMLEwiAvpM5gLuHNcPntIQZ7pSCG+wc+bvH08fAF\
a9yzc9+2S0KrPR+8vwZUzIrVaT/+fGWwkvFl+Pn3G8Pq0rNejJP6pvTf11tf8Pvv\
DwZmRlYGZqAtiFCFOOrf/78MAWpZQFf8ZDj7ci+D6ee4vYy3vp38v/PaMgZ3xXgG\
YS5JhvrDYQysTGxAQ5gZvv/+wsDOwskgzafM8P3PFwZmZhaGEJ1chjDrNFuG5bfb\
/7/88vD/5VdH/088lQuOku5Tyf8d7ZyDXz59/Spxi+7/i2evXJCUkNTg4uKWhLv9\
z/9v/+sPhf2/8vrY/0mn8/6/e/v+4+9/P0Hxxg2Sv3T+yo3f/z/9R09lDBwcHIKf\
f3z4v/f54v9f/r7/z87OLkBMPAIEGCM+SSMDI0Ng6gl3cXV2l1GR0PzH/pP9x78v\
DH///QYGIisDOxMnA8tfLoavb38+v3vz/nVzC3NzoDzzq6dvH12/cuPSsRPHj2/d\
vnnPpcsXL2G1kIWFhbW5obU+tyir+Oq3gxw7by5leP75PgMTMIBZgAHNxMgE1cAI\
jS8g/A/MjP//MPz594eBkZERnAz+AB0EUq8nZsPAyy7IYChnw/DuIsMJGztrB0Zo\
8HDt3bl/i4w5t+PkoyXAGPuKlLmQwX+8wQUqc/jYhMAOkePTBDqAgYENaM6rr48Z\
zJVdGG6v/zaLSVdHT//j5w/vj3HOdWzdl8TAzcrPYCntw2Ai6cogzCkJTpj/kdIe\
2Nr//9GsZoRa+Jfh3Y8XDB9+vgY6+hMDP7so0EIOBnFuWQZlQV2GHz+/MzLu331o\
z0fVi867b65kqLVeynDg4SqGcy/3gYMElNgLTacxHH68nmHHvYVAX3MweKkkMpjJ\
uDH8ZvjJcOjBeoYD99YCU94fBnNpd4YA2cIv7969/cLDzy0A9B3j9y8/vz57/OLx\
9u3b90yfNW3mq1cvb7O8fPnyjYyBJDi3fP71Fuybn3+/M9jLhjBI8CgwdBxPZOh0\
3MogzCfGcP/jFQbJL4Y3BVglNEA+UlNVNz1y8OjWG4z7RPfdWcPAqPGTqyShNG7d\
hrXr8aVS1tUr1q53DDP2nnCkkOEdsCQV4ZJi+PrrEzjn1TjMY5jasnBCZW1FiYmx\
qSswWL5euXLlMFpi4/P19gszMDQwPHHq+PHt27YvISpbALOBc4BfsK+SopLsu/fv\
PoCS9M7dO1aD8isDlQAAtJYyp/HEzZMAAAAASUVORK5CYII=",
        "CentOS":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA6NJREFUeNpi+P//P8OXM703GHbVrLn7\
/9+XeoAAYgSJgADL5Ni5/3kMPzAABBBYZMq96P+ee9QZHjzXZWACSf/dGM3w2OkF\
g75yMwNAADGAVACxEpRmYNj6YuL7/Gta/9ekzAHy/8sxLsxc9F9ERYLhyd+rDHOW\
v2JgyM+Z+1lDruz/m2XmIBXKAAEEtuXQm8UPv/55x3fv41GBoGsGDPefmvx5eObO\
18gFWYYgW5XvfTghd+znfAFeUSkGVkFlhj+vv7G8Pnyff/2GU3tYgAru/tzt9+Pt\
BX2O35yCDBLZexnMLH4xqEvuYRAP6E6COVMR5NQrP7bcTz8nBbLbCWQ/ELMCBBBM\
ARh/Od13AUjrIIuBHCk29W7CLU0+G065xzfYzvRLM8hZ6Hz4/+//D+tcN0mQI/+K\
sMvwP/p2ke0H20+GK+vvMTw4fEuA8S8DHyjYmO5uuXHo5J/FDDz83AwC3NoMNqmO\
DN/uv2V4dPoeF1Bel1lo+++p0s9jGL7tFGIw8k3oecl83+qjxAeG71IcDNt3PfAB\
ucFIQiTprJe3EYNB/BeGjP/vGL4z/GRgEVT6w22Uzwpyw1MRYX6GO3deMvz4+p/h\
z+PdDKxCwMB6e+UfOGqBJjBD/Wxdc93w/563i15Aow8UNgwAAQbzLxMQiwKxOMjb\
QKz3/9b2a69mKP9/u8zo/79nG+8DxUyhcjA1zLBwAlkkPvVe/N1DrxdxB0lXM+x/\
PYfhDcM7hhrWFAa+EzIM01IfMHBy/mOwLnRj2Ne2iUHTw/B34vZiLaC+OywMECCs\
zefI9OT7eQYmYADaikYwMLPxMXC8+MzAwPyLwTLDiYGD7R8wPTIzyJuoMGj7GYH1\
gAxgPDJh55Uzsw9rq+cqMPzi+sjw799fBuZ/7AxiUnIMuu6205je8X3buuZ4ye1r\
Txj+fP/DwMTMxMDCzcowZ90hhpgY+9sgL+heXn5sw4TtZ5TWbDrLwMfHyRAQZM7w\
9cNfBu8sPgY1ufcM2tcvMvznYGf4cXsjA8Ovdww/RFwZ9v+tehYSbBgE8sJl3Ugr\
U/OPX+6qqMsIPH3yjkGIh4vh4tHbDLdfvGQQ5L/H8OXOKQZGTT+G/zJeDMwCKgxc\
bDzfQnQMLYB6HzNBw4CFk4vz5907L79rasl+l5UT+a+iK8AgIMjK8IddkOGPoikD\
M580A6uY3vc/b69+///vz0+gHlZYPGPF//7/09n0vPXq4oeFd/78+2WGSx0A8/r7\
BDg6FqsAAAAASUVORK5CYII=",
        "OS2":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAArxJREFUeNpiFKt0ZwCClwxAxhcg4z9A\
ADECGVZAxjEGLgvF/8wCnP8BAggkZQGSgmEmIHECpIuRgxVEMQAEECPUlItAfBCI\
8xiQlQMlf4G0MIgWOjGwKQgzfD/ziJWBx0UDWUUTQADBzNj7qmOXE8P//wwwAFTI\
wGUqz8ECZD/4uP6iPJe5Alji24n7DMKZdgxMYCmGHyA79vJ5aoEluS0VGYQSLRne\
Tj8Eduaf118YQAqSgRx2Hke1Hx9WnmX4sOocA7e1Mkh9E4soDyNAAMHcAALTgTgI\
iJ8CcRoQnwEJgizi+Xbywecv+27CFIoxMjOdFi1z3QRk+zMIxpn/R/Y8OEg5WP8z\
sjKDvKnDwiLCAw4IGHjdv48BGMrggAGCVUwwiS/7bzH8evAW7Is/Lz4xcBrKgoSF\
mf7/+8fw78cfBqAvwF77evw+A7uGBMPfD99ACpayMHGyTXo1YWceAxpgkxNkYFAQ\
LmLmtlXZAcQ8///8s/r7/hsDizgvg0i2/VdWKX5OkIMBAowFKRy4gbgPiFM+77jG\
9PvpB4Z/X36CJZh4ORhYZQUYeF01fwO5U4G4Aoh/IieI2cA4SgF5hBgAjeheILME\
FNCzfz96n8JpIAMPDYFIEwZWCT6wh0GRDwLARMrAxAlJhpy6Ugy/Hr0rZpMT+gcK\
xkiQv0DhCzIEpBCm+eeNF3DNrJJ8YMNB4fBp+zUGVnE+kFQyyIAPyIkclKK+X3gC\
jgtQsgNp5tCUYAAmSbA8O5DNaSjD8GEFOKncAYWBEZBx+uPGi0y/7r1l+P/jNwML\
0AXMAlxAQz4y8AcaMLybfxysGZQCQHEITCYM3DbKf4BCOiAXnAO5kt9ffxNQECwJ\
sh3k/L8fvsM1g3Pbr78MzHwcIM3LgFwOIL6JnJxhQA+Io4DYAYgVoAn0HhDvA6Uc\
IL6BrBgA217uJvXBdNMAAAAASUVORK5CYII=",
        "Android":
                "iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAYAAAG6pMWvAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAsJJREFUeNpiXLnJl4FZ/KUUy2+RN99+\
/2XmBAggxnWnTSX+PpN8wfLtN8tzBtHX3wACiHHJKVOGv7/+HmYAAnXJD7YsDL9Y\
GZiZWGyA/L+//7AwAAQQ48qTZgxAzbKc7D8fs/z+x9gElHH89YdlMwvDfyYjIMfm\
3z+mVyzKYq/m3X0l9lJN7NUagABMjk0KgWEYRe+9fZGv/GUgizAxtQRLsEUjY0NT\
kaGJMiOKJ0XKc71DZwHnHC7XU/CrdnMwjnNsMOxMcDsdW9369a5CaShXiC0I4RI7\
sO/FNTVT8R1EP/EH6Ufd+OwrlsdSLn9pKynTac5HvTt+ApA9xioIQzEUzUuetqBD\
QRAnf6GCgp/g2sXJ33PQwdUvcKjg6gcoiiioWMS2kpf4FLeGhMu9XDjEzNPhtxmx\
Gkc+J/ICkGHzXQfhcKlay5yEz/LVWBSXNth7UPonyYHCSoEByITYuoIFoY3n9v/4\
34qjLfpmAdXJMbC8q8QoB4y7+wk7mnl79ndjwWncOSU0SHqgataWZOQEmVDHx0eU\
fwQolOpZGoai6Ln5eIlFAqaRiB8I4iIORUEXEQfdHAUHd2cH/4ajY0cR9DcIFSqC\
Q93Exa0UFJqi0ZI0afI82Ys+uPB4736ce86R25tjoEImGrrer2fm8FJ0bYfVM4CO\
SklbTj59ZkRBDC0oUhdy3dmEzYKylPNxXrsIvQ18kN9S57DEwazXwPtXB8pJTgst\
zZUgglw9bTeNTL2WlSCityZsVkGEsvMHZRY+lwwtEnZSmsUz/z4Zh5OKKAO4tKJ/\
locjZ61SVbGTjf8PqYbNXGXwNmerbJ8P7l8VTNaZll06MDToxf7e6tvP+kLvgOP9\
6p9xT0jspyvYKaE51OWIeXFRmANDWWN0Bz7ZM9BY6ia0ektGTnveTRB4320OuJvy\
Yv0SBXjsLcK0c/wCjA4enraDEnoAAAAASUVORK5CYII=",
        "IOS":
                "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAYAAAFRk36sAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAqlJREFUeNpiYACClJSUbsba2trbKkAA\
EEAMcNDQ0PAfSHECBBAziPPmzZv/pqamUUAV3ozMzMySJ0+efMbBwcHw9etXBoAA\
gmuRkJAwY1ywcMHVf3//Mfr4+GiyPHzwUIuXl5dh//79DIzHjx//LygoyPDu3TsG\
gABiQAYaGhrOa9eu/Q/jM4aFhU3Oy8vLAXH+/v3L8P//fwZGRkaGioryBhYgkLp9\
+zYDKysrGP/794/h169fDMLCIopg7bW1NZuB7voPAx8+fPjv7OxcAxBAKHYyMTHx\
7Nmz5wEDNnDw4MH/Oro6pXABSSlJq6dPn/6/du3q7+rq6v2PHj36f/369f/AIFBi\
vHTp0v9Pnz6BHQJyKcy19vb2jCz79u1jeP/+PdilYmJiDOzs7AwXL164BjKVRVxc\
nAEUImxsbCAHMfz+/ZvB2NhEC+Q+Zg8Pj1R1dXU+WVlZBikpKQZ+fn6wQqAptiDd\
7CA/AkMH7Mfv37//BzkKJAEQYHhRVFTU4itXrvxfsWLFa6AjFZDlGJECh09dQ91O\
RFhE7PLly2eMjY0tgMmkatKkiatevnp1WFpKWuTuvbt3nz19dhyo/DcjFxeX6qJF\
iw5aWFhIfvz4ERwUwGQC99ifP38Yfv78CY5MoFqGL1++MISHh8exlJeXLRcQEJA8\
evQoOBJB4QYKIpBGEBsWniD+latXXpSVlpkAbXzK8vLlKzZgDIBNBtkAwih+AWoG\
YZArvn75ygU0lBfkAkYjI6PMpsamab///GYAJiV4MgIpBAGQ00HxAMKwtLd5y6b1\
4MBxdHQsmT59ejdIEORMUBYA0SCbQM4HRgMYg/jA6PgRHR3tBg9VoA3CRUVFvUBB\
l5s3bz4GRsHWJ0+ePNIBgoiICE+gH7k6Ojrm7Ny5swuU8AE9EDRe3EOqBwAAAABJ\
RU5ErkJggg==",
        "Haiku":
                "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",
        "Windows9X":
                "iVBORw0KGgoAAAANSUhEUgAAABMAAAAQCAYAAAGDw3T0AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABMhJREFUeNpirqurY2BjY2P48+fPCQZp\
aelUJgaGjy93Mf0HCCAGJiYmBl4+/lssikpKmxgt81QBAojh+8JMp9+9LvMZGBi+\
L/eV/h881/4/S7doifgLdsafDAxKf9OvyTAkch9mAAggBpCpIGBmZlYOpJ5kZWWZ\
Mf4ukWtl5BORY/76OcZbVJhhT8X5zwwqampLgPY/0chZ/f/7Sab/zCyc71iCJp6+\
cf/t9593b91Jckr9z8DI+O8PQAAApABb/wEkJydd8/f7VPbv6xH29vYp/v8AEmQr\
CgIxGQwAsD0cAPn0+wDHjdb1BNiMU+gDzbbJ/vcFLgIfJugBarNPdjYRBmi66QDK\
3fkAFCAKAAIDA/wEixaAEL8YZwcbCPfa2fIJIAAAs/tkPNkG5PiaAO1tcAAFCu8A\
AjAH/QEODg6GBAIBLB8eHPje3+A09ff5GxQTE9ItLi6OFBQU3PX19SXDw8OBAoi5\
pKSE4fHjx2C/5+bmMkhJSap8/Ph50Zcvn3uYmZnzXFxc5BiCQsO9FBWVqlRUVNoV\
FBTOO1sab9sfKf8fqOe/V7fFfx4Jzv8sS8Plb7+2Z/n95hcTe9aic8oNtiI8Nqzf\
wSazcbMycPCzMbAwc3D+E1PQ+iv955sAI8MZLlaG/wwzTr4CKzo09TrDj7c/GFjK\
9nyQeXT3tu71W7cVv3z/KZV+Te6tQPASBoHDYgxvF7xl0Ar9z8DC71XzUvPVnSuf\
H3x+9mxNlbaCQzzDF15hBhYWoFGM/xl4uBkYmJQE/v1nE5LhsrXQ+/L792+mf//+\
szza2sPw8RsDg0sWI8Pz10C1Zqam/vx83HLffv5SuHvnnqewIP8DYVHxC/z8/DvE\
xcX/nD9/PhsgQNPkEtpEFIXhc2fu5DFtTCCapGm0UCxNEQLSWFIUyhRBtAvTgCU7\
pdSF6EKhK3HvRsGVrsSAWhGL7pSAYn0TlCQlNZ0YtYmOHZPWksSxmcm8vBNceFf/\
5XAP5//Pd1EymUwEAoGnLpdLSaVSqiiKjKWbzaY7Ho+PZTKZefKAKhaLhy0zGAFo\
JCCnxw6aooHa1rsmHQ5HC60tXAw/5iXmzeK9RsneN9O/q6dQEhrHWcYs/5Y64c9f\
hcizC5w42VNJAGZgMd+AE48EOHZlHOw7GLCxGJ5fzkGD/yNhT3AQz/q3N84McJQS\
PJDXNkWaVWpFAowrei2rgdmxObGJQSfjMAAda22AANtoAhUFiEJgGhayyMBX0yV2\
OjpgSBXd2GeU2fXVZY/HzVLv32aQrPT3Ao2VS+lveGn5ExiMhzRkAFMm1G+8hpYE\
sCaSn6Z1bZrYe3C69rIu+NM/hmX+7v2oz9/34ed6hQuEp1YcrqoOehm8c3eoCe8o\
0CSv6pPr8OvBWVi6icBuJ2P2IhifMSFTAAOr/jE8vHtwY270kJ5LnHu1JcnbwYA7\
r6rK5sP5qSFkwWjqNBgANEs0scjQZBE2UmFIM8KFqnV3oOPbs5Gd+4+elL60bOyR\
yYnOXiRpVbFNN+rfh1Sl7aAxTX+8dR5Wc+/g/4Ojxj/VDRGcTmQgwgiEQqFILBaT\
s9nsKXLPrRQKp8MjIy94ng/6fD6e47gFWZa3iDYFQQACI7AsC16vF9rtNlg9arXa\
nr+8IuPqgdsVdAAAAABJRU5ErkJggg==",
        "WindowsXP":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABBBJREFUeNpi/P//PwMIsOzd94Hhx//W\
UIAAYoSLlE1l+C9lq/oLIICY39w4x9Bh9Pq/vao+n3bf+52MyQ0/Dr158c0qUV2I\
2VSdgQEggOB64ODTipqc9xEM/wPqGf5Xn2T4z9Twrnmyzavn32X12P4K305MZmie\
/O7G1Mkb0j8clfn/6PZuBoAAAIQAe/8B6tLIAAD+/wMVxXv8/9XJALrM/vQctqwU\
1eKx+R8ROAAC+/f0ABCrW+Dc8gys2t718+91aXaTs0v48AjE/6XIZ/cBo6rvJ/QE\
ENjM1f0A3snfxFoyJTxKOQ/5Ghj2B+IMuhMCDAXr2c+8xwE3G+0Bc1uMeSgfAQAR\
FAoHxd5CpgkLEe4CCNMfaIDl9eVTDPybCy6y8bLr3d14gOFDwSSDv3rcF99+ecjA\
wybOwMLIxcvA9u+THsOLrwxP3jIw7Hmzvvbj6f3BegaqDPcPCe5m+vvoothrHrnT\
z39x7/zOKfTy8u39wcLCAgzf/79msJBLy2SaeCUkb63CNtPMX2fcH2eejZCUUDzF\
zsnH8OQ6xw0ubp67LC8/Mpfy8jMwvHn8nkHWqsVeneO+mS2H6qcrPz9KSSuoMTCJ\
8f38+/Thx1tPH35n+PBsaZYwPwsDI/Nnvq88iUWfPzxmYJJhu8nF/OGO+qRGNsZ/\
DBKP+PnZGZ4+e/tTXidhHiefHANAgBrJHrSJAIDC7y53Se6SXJML0cSQ0pS0GjVQ\
WxzyIyoogojQggidFJQuDg4uIi4u4mIRqkuLSEGXikIRrYsuFVprbJomkHKJtTFJ\
c0mv+f/vJR6Cwxsfj8f3EZmvC//+9ggSfO33oLYcH++VUmcQ/8HVOXeQHBt/lep0\
ox3fUexX4kiXQjBoDsPI2NHutEHRh5yAigaZF46pV2fDPedxmij8QUvKQVjdPS+u\
5ALJm4GP62+mrwf8Z6dlovmzDQ0tysnRaGTLRynb6HW70H1/+ZS0WGi0ykAmDkmS\
sVsAyMmL88vx+YdgJdvmXnbObnOgwbQQ20pi+ODuFCVWOaVTtMbYO5+rfSMruZrO\
ILsPxKGh5W23Kkh/0q5dLlYlm9NFwNhnAmugFWYC1PnhDe+piVliaUki361xIdcA\
5VHTQCKlJLaPRLjQuH/rywOb6sk105HTr/NdslBp7umsBr2WazdtGvuN5yRrTlPh\
pGZKo6M8ClxsZxVe+SaSQgUXfNVnZmrmXD6b8PL0L++o3QyrQ4dGaQfrZf97Xs+n\
iV4dFFr5VD8Ex7fFaophtPD0W9zcGDt5xTvXSUfDVwesAG9kYDIaFFaiMkJ2dY7b\
96BYLMsqEAtvBWRzNWxG6tDrObDaDD4sPkajvoMXM49YurPhL4rBQTXDNxsyH3Gd\
mAidHLkk/9f9L2yNwn+iFKd3AAAAAElFTkSuQmCC",
        "WindowsVista":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABAhJREFUeNpi/vPkOoPwr/cCTObB6Qz/\
pdk8AAKI+Xx5VNB7NanrTOsdWtf+E/6wDiAAACIA3f8DmndqAJBJ9v/7Cwv+Q4Mq\
wQEdYI2/4/78+/1zuUX41+cAAgBEALv/A/3o3AA6y7qX8DYstT9NNQAAt2FDm+er\
Lf+nxlv/QYw7/wAEltT/wuP7/3CHVqcYGg4yAAIxS3pSUzpq+sMr/wAAAAACiLE/\
J5GB5d9fUfMHh17xKnEyvP3059McacWCr0+Y5vOK87CyvPv2nUHs7oGpld9E4wIk\
Xlmf4zJ4FhlqOu/Wq5PzDl1485lR1zPe/7J10oYQBREGlhuHly3LZo1i/HqFgeHj\
TgZGk5s8DMhAiI+Da2Ot7LGjLbIPbLUF4kBiAAHECAqNi9u28H3YtLL2DQ/vrZ5b\
L2br2qozfPvxk+Hb198MzIK/vzPw7177VlT6j4OC2FffXR//PuMXFbv09/fff/+4\
GM1ZuHh4GaRUGbl5LNkYBKWZGNwMdbM4RZ/POnrnK8P9PV8WMjsqiykuu/LixZZL\
TPM4WD9ymQdH2v74/p3h86+3DNv7r4UxShTM329sbOYQqyPGcGP75IxvrE///2J4\
HXH22PWLh9ffLmR5yyXjcPrTdwajd38Z9PlvGXi7GWRw/H/KcJiFQ8ZuPUMhA6NH\
/kYmE/8KrpZDX/5ddv35+6z5/2+bVP7b6IuHMaCDMFvBrHN9ck9npEluA3KZQGIA\
AQojl9AmwgAIz+7+mz9r0iQ1JiZxU4VQFa0t9CB9eBQ86EFBEAWlQigepPVx0YNo\
LhYERQiCCKIgvVikF6HYg6ggagWpUiNa0+ZBGxPzNLvJdh9/jD3pyYE5DQzDfNzz\
B3H8ocKJBGx29qaQ+BDlJbhEiQdHeKPqDTy58a0WtYc2qcEuD5T2HN7Go8PjRD5b\
AVlJLaMliHCUVw9vrc5fcOyVYPMLEFwcnE5enHqVo/Jw8PbwERpNpWpZPcMWKlpL\
XGTVXa4uYpBS9Re4FrP31D/Hg7speFkADXGQZB7FsqXOFOnMmfP744ZVg11eCXe6\
8+GlggHaoHh/9+sIeTyfQt0bGbgYOpsYCPeQoW2b3d3+DeXM3Ivpe1fGrx8/N3RN\
DgSpqkrgBRNMaEIjCpaeqi+zidwj0l7jT+84NG16fR6LUqzpOkzDviW0vffgrYlj\
yRNH943+zOQ+zr378rpWzFhhe14edJLeqWc/xtrXMVLcuCdWh8uDpok3IsMqdPTr\
TeQmY3cejrIRVnoLN6n0HRgs9EEtgdQZYpPa/YVk4dM6BWKjDlNfU//h1RGITJz2\
nbx0ClehGDAaFljbVDexWHJr/ZeTOxWlkV4vwH8U6LR1yz4S0XQYy3n9u9o003/n\
vwHCJq3KswmSWwAAAABJRU5ErkJggg==",
        "Windows7":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/ZJREFUeNpi+P//P8PF6/cWsKzfe2HB\
kUPz4gECiAEoIgvETAyaC2/91/GI+w8QQIwgkcOzpj1iFWJiuMAkwsDEwMDwLHHD\
W4Y/z2YwVE+5zgAQQCA9DLfvP219/e5jJIjNMnnx9v8RnOcYNjBqMzD+4ytjUHEq\
+r/zwe//pROi/4vZF/9n0tDW+pSTVsOg+vgRw83NzWkAAQSyheHF6/eZV+48nsbJ\
zs7AyMTEwM7CxHDj7uP30f4O8oxnrtxrW7jlZGUBw2YGVs1nDCtfODAoGbxhuHSH\
n+HyCVEGxk9ff0Sox0xc/tzEnMGV+SfDrohdDAxvtzMI53kzSEkIM4CdCcQ8rfMP\
nZH36/8v5dX73yh2xv/3n76nguQAAgjsBiBgev/xS9Dj52+82dlYXqorycwEit0H\
SYAUcK7ZduS+tIyE+J8/fxk4gA788vU7g6KcRKmCtFgP4/rdJw++/vTdzu/tXgYu\
cTaGzdwqDJ9e8zD8/PODIT8mRI2ZQUR/Pv/n5wwSLMcYvgg+YuBQEmJ49e8Mw42z\
fAwcXNyMLAfPP2TYZmjK8N9+LsOjvWsZBO/eYHj77hbDjqM8DCbGupJMchKif76y\
8TEsevCeIUDtIkOb11MGP76fDH9ZOBm8bPV2MX759jNCwb1xOQ87C0OS4XkGV/F7\
DJn73RmE5LR+7J2WzAsOh6/ff8WYJcz6K+PT918aiGum77sMFBcAyQEEaJpcQpuI\
ojD8z3TuNI9JYpKO06QtKaGg+EBoKg2iWxFDoWAV3OqmFgRXorjVlQFB3FXBlRTR\
lRW7UlTQ+KAQq5VaFG1jSSZpMplHMtM7SbwpBDxw4D+cx+L7OT0O3fCaDfvkx/za\
FUpbacnn8YiisNtwdigMs0mZ/Jwe3383HJQWmTZ7nPim7Uw9WXo/HwxKskSbiFQ3\
4YUNVxSh+hToQhSkDxAYQ9dtY7NY1s9ljs1FQoEFTjOsmdv3nz3yeT2kTR1MI4+R\
uA1EO2ijhRcbw1AmeNQNC4VKB1WnBaImUS5zneuz0xeF159+ZBbfrJJELALC72DZ\
H0O0sRdDvyrYWsthIqPgcFBiHLZAyR/8Xh6Dynp/NYNLvft2WhiUw6VizUHNLKF4\
9AQCcQVnh0IgInCwv4oLqTi+5FeQsNcxWtPx4FUSGmqgrgtFDle6DEazD18u3Hqc\
m+TZEtfQYckjGAtYyJ1/Cv8exk5jvDQL15YmMf/9CLi+DmbPpFdvzp2a6bkgbRTr\
ly5nn9/48LUQ8nvJ7v8ZFgVpm0y7MNx+dp1H6sBw497Vqey+xMAdNqL9b2M3GGsk\
t+vN4ys/1fGCqg92nYoNBEqHknJeifjfsnqdpdtb+AfYxLpB4fozegAAAABJRU5E\
rkJggg==",
        "Windows8":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAflJREFUeNpivmPHwPCjU0SIkWP2xr7L\
bJncAAHEDBL50yrczqQTu3Fm5l9eIYAAYgSKvGVgYBDqzBJhYP3zn4GRYf6O70AB\
jgdMSQzfGdgYAAIIpAIM+tKEXYFUMwuQ+M/4n2EDkA4ASYCMnwmkLpxmyzMACbD8\
YGFPAwpsYIGqAAggkBl3gbQSmPOfYUdHtogHyDYYYGH7yyAP4wAVMP8F0kwMCMAi\
l7LjI8idUCVfH/xMBDsPrgCIhaFW2DIy/OcHGm4KZEvDFAAEENwfQOMZFgfzM78S\
YVEHcm2A2BmINUAm/AFiZpAipn8MUUBqGZIT3jHBJKHgHwMaAPkCbsX///9Z/6LK\
80NDCqgAFM4svbO1mR6mIin4Cg05iBImRsZ9QEelobsBLwD5gheIjYDYjYnh3xcg\
/QMUn1B5NoAAA4WDKJAhAcRSQAwKdgWggxWB9N2lgfwnHkuxzgPGjSDUMHTwBSR4\
B4j5sEiC0sRlIBbF48JfTNCAJhuwPOGRaEHyEzS8gGHOwHiLhfnvNYH//6uYwSJY\
wXdGhgW7f4ICA1UcrGHnaobWJeaMNxd/R5dG8gILw/+/XxDJEcWA78DM8fsftvSB\
FIigMDgLxI9BGtAkudDSGc54dsMUZgRK/GbgYvwJTMCMW4ACYkAsA8Sg6FWGYgUg\
5gQAHYqE3owvZdUAAAAASUVORK5CYII=",
        "Windows10":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAt9JREFUeNpirLn6neHP//8MLGuf/t4k\
w8nIABBAjKWXvzG8/PFfk+XQmz87GRkY3gMEECPj2vdv/zMwCDEACQagCNP/fwx8\
YA4UAAQQWI+xADPD+Q9/Gc5++JvNwLD2/f+iS996QDQIs8hyMu0SZWe8JsbOuIqf\
lfEHy+Ov/9xe//x/+dXP/2FAzAAQQIxOhz5X3P36z/v5j39GmUrs8yfe/JnNwASx\
EQRY9r36Uw2keUA2A8X+QKwGYqhLWBgZGX79hwoyMQIVMMHcB1VQr8kh/Bfo2e9/\
GbnVeZnEzYWZfzz59t/l1a9/+r//MHAABBBjyaVvwNBgYGAG6hBhY2T48Y+B4dPv\
/0JPv/8zO/b2ryPLrld/Fj369s/mw4//inwcjN8//fzPCTaeEYzesVz6+DcWZic7\
E8MnoBs4GZAACzzcgPSvfwxsMDaUYmcRYGPcLcfF9P/9z/+/DAWZ3x94/YddlouJ\
4fXPfz9VeZi/MILDFASAjhPlZHwJDEVxBoRP3zGBJJCjBx0wlgOjCyT//td/5S9/\
/1tc/vjP58n3f9Yffv2XBQr/AQhQOdmrNBBEUfjO/iQxYhQTYoL436mFpYidrY/g\
Y1gJVtY+kA8g2GkRtVOwEIIGxHF3djM/15PZGBe1cZthZ7h3zvnuGXF2ryizTIx+\
iaHQOGq9aV7eb4X5Rd8cPCZu68PwGvaWUkttZXnWdywSoqPTXqa92y/8otC7UKue\
Xw7M0UsGzeKnrglHGYiCHZUT8J8v6taCm9TyDIZA9UhQBYnIkPRmRTxtN8JrOcXz\
t9IO0Z2nQ6IaZg7LrooV/zJ6Tt0ubq4Xk/meEMJ6hYzvvSvX8EHBptLjQzFemfKR\
hWzivWQFNRqqlC/+49wzCCiJDjvxcT93m9LQOkivgvhiorkNMfFw9ARdCS795iRO\
eorAAN4BH6piMHCo3pmL6CGxNMBz8b4NCzynJpp3kIeV15w37qTtfgKOjExLF79A\
AwAAAABJRU5ErkJggg==",
        "WindowsPhone":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAkRJREFUeNpifMEswsAoLc3KwsjHl8fw\
+QsHQAAxvlQ0YGD49aeA5f+Hz2UMQAAQQIwvBJXfAmkhBihgYmBkZGVAAgABxPhC\
RImBVU2d4c+tuyr///6ZycLwl/H/7+s3tgIVezMwMjGwAFWVM/xnusfAyHAIZuh/\
BoZ/UBWMDAABxPiCS2YDAzurPcM/BgGG///3MTIzO/2H28AINIKd3QPIZAfaDwT/\
//9nQAUg4a8I7v8fDOgK/r5/rfL/6xd3hl+/ljNycj1k+PfvA8x4EAAIIMbnXBIM\
jAKCDEzs3AxMclKMfx8/EWD49t3w/9dvvkALHVkYmdkeMnz7Kffv20+Gf29f72Fg\
ZnEBa2UB+vDPn3csDCyscggLmX4yYHEkMuBA43NDQgruCQZQiO1CUvADGnIwBcAQ\
ZASGIIwLdAO6FRiAheHnd7N/f/+5MbKwujKys74HBjkwDODyrAABOqd23YSBILi7\
dz6BTUEIXUoQAtGhpKfIX+Q3+Q2+ISlTQjASPj+W2cSFgSiROMmFb6zZeaz5Ux5J\
ez7jNEspCQsENGEJMw4ualGMtIiv0DZGgINvE1aGhYhHyzL3NHw4saKrGkBdtl4i\
6RF6TT3L/EITc/ctChiPREr3Hg++jZIObiHZIjXzW/wxIPeA3vCVu0ZAOmrVrrup\
dbzYbW017OlX2Kx1V/X2YPhetIqopqGfdNuKbHSjAZf+3wya/Gvq+hkqqcBTk7jE\
NoTC80qq949esztk7GRBiX8C7xLsL1ja1H52K/MMvKjBGG9OV9EAAAAASUVORK5C\
YII=",
        "GNULinux":
                "iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAYAAAFRk36sAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnpJREFUeNpiYAACTk7ODBDN8B8IAAKI\
AQ6+ffv2H0hpAQQQmMPCxOjoZ8fzH8y5MottpreT4v/vP4EarileAAggmI47cL3/\
rzH+h7EVQMYKCwv/Z/h/yxzE/n+wn+E/QADBlbKysoRraBr819HR/c+ADry9va+/\
fP35/7t370CSZ8GChnIMDBJCDDdBRv38+RNspImJKVAB4ySG3VNYD/2/qvT//3WB\
//FJ2f9ZmVj+/3+g839+ndg2gABCNrmIi4vrJgM2EBYR87+opAZk3yQMyRMz2f5/\
P8j6n5GF5yS6nMiv3//AjpGRkQHp5oPLGBsbf/gPBSdPnvzPxMT0HeJ5Zgb2jRvW\
/X/58iVY8tevX/8ZGJnBAcH4+7T0n/effzK/ED/JoKulxPBwtyPDq6fnGQxUvwoz\
sTD8ZRaVkWTYvSSZwcbWjuHhjaMMxoYSDBbJTNIAAYbNV+agWAFhDg6O/+zs7CC2\
D7oiFnQBTi4+6fJsTwYDpccMz7+pMOw+8oFh3fpNYUCpLcjqmNA1Av3CrKEkyKAg\
9I0hOtAV7EQODs5YoJQjAx4wbc6cOeCQ+Pv3Hzg0Hj58+D8+Pv4/1PkzsGlqam/v\
AGv68ePH/z9//sCC+j8oCWtoaMI0V4KdOh/oiGX5jC6fDotWaAjtZ7hz/xUDIyMj\
akC87GXg+H2bQVSQnWFRE7fgylZgfNxYJ3BQ3UDLjuHLXwYG9t8M+w4/YhAy3s1g\
YGAA1rRx0y4GppvhDL4hAgwMf4QYGJg5Gb6/frqVkZudQV1ZgsHOWI3BNNCe0ZKb\
5T9PWh/D4ruvGG5AnSbWFc8QY2/EKNe67P+sTScZpgDFXgIAa/MXvMc4nW4AAAAA\
SUVORK5CYII=",
        "DebianLinux":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/RJREFUeNpi+P//P8NDk+yZTAxA8P/1\
x3SAAGJ85NDKwPj+KQMTx7ePDD++/F0LEECMIDWvtDIYfkiKpv158sKIBaT2y1vW\
bi5TvlLGP8wMAAEARAC7/wDuCy0A4jd0eORgkyj/AAAAAdobY7vy59FFFjtFCwYO\
FCcCA//6BxUuQFT+CwD1A8KlzgIL5yo++enqrA0rGgAU884AAghsy1Mpf4ZPb5n+\
8zjo2fK4GR35fuaN3sd1m89LM7xgBtv6g0XogmiwBuO3h88z3q47dETq6pNbzMGm\
iT/fMRqCTbgjG7v5y/MHvgx87AwSrk6OLNyM977f/fFQ9lATA1gBA2M9w5tOLY73\
03cXc2lItH7bcYqBkYmDgfvfcwaAAGI8z5nJYMC9h+Gjfb3Iu9MH5jIKcJ1m4hfr\
lj5c85MZqJnp3/+/DK+ZFfPentq3/J+CgD+nhXHLz0sXrn7ktrUEuY9F3Ixf/us5\
ZllGRT7XH3ceGXIICQqxKymrfGGSXSfEwBDE8vPr7zTBEPfSH59fMfz/K/yS+8zV\
87/02Bi+3uIQAZnAxMDK/Ivx0XOGf2d/Mfx/9CHzk5yI0M8nkvbcb+7ZgxWw/vky\
5cWFewtfPTrMwOet1/Cfnc+ZxUTmoNCHm//BbmA9I/OWg5udhUWUjeHv669/mcX4\
VjP8A8uBAYsEw2+G32zC0U8Ff0/5+5+98cfKXa8ZGIGKGeQZZIAKAAJUSS6vTYRR\
FL/fZB7JzHTyal6VNKngAxKrLgTBndSFuBEEly66cBHBpRRcSOk/UNy5FApi6cqV\
UhUJtQoKrTYLFyYxTZyYZJx0xjCPb2a+cTIgxc1vde7l3nNOaNQ+X4MStQNJ3obO\
wq1lq9F6TBxToOLCHlsq/PYGWt7T9CrFxpqMBMvF9kY9AiRokQ9hVlJlFsb60pl+\
9/CLSGAluXRBtO0JmL0hxBbnAVgWQI0A3m7NG/1ms7Vwd4eZzT0qA9TDOlLW6J47\
7H8UJOGk12yvK7sf4OjzQVFknfsuAdb7OeCog5d8oiofJmo3aoAcjqRsI/xxClcz\
C3Q2/T565bJMJipEbQXs7viORQvPnBd1nOayCMduZuTeW4PpvKmwJ8obPJNtwD8P\
+ovrtw15fy1ZzJw3x7qldSZA5ei4dKn00PmlSb7nv47E+arvUCJiuNXCu6d/aGgf\
ewBzg80oH+8NG99VfyaVJymkI45odIZ7QOfLgCce8Fl6yx5HwP2hBAPkOKYpCq9y\
02N2cWJuRj6lbKOu+tzG+ImrIvBNBfBeG6izgSadAx87U+3/CwC0kAiQJ16/eNX7\
1EWsq19zLMwElf5KRmrPGB0Fim+hrgWVgOfgdMC/TCup1Pu6+FkAAAAASUVORK5C\
YII=",
        "UbuntuLinux":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAzNJREFUeNpivOshwgAED5n+ff/6GMiQ\
AwggRqCIBpBxg/H7lRP/v+xbzQAQQAxAEdVHyRb///349v+2A+d/JqD07V/3rzJ8\
ObiegZGJmQEggBihphyC4hqQlv9fT+35/3Hbwv9A9h9GoPH/7/lJMzAys4BUMjDd\
D5Rn4POIZVDa/hrEnwMQQDAzlgJx1L8fXxn+//rBINWxgeFFQzQDIxsHB8jWowxM\
zFFgHX/+MDBx8zN8ObyRgT8kB6TxB0jBof/fvzD8fnyLgV1Vn4GRhY1BJKON4cue\
FWA7YVawA/EXIAa75P+vn0Dj2WcDmWkAAQRTAAL1QJwIxE+BOBOIL4FdDcTMIE1A\
3PDv6yd5Zl5BK1736ItA/iaYgi8glwtGlTAo7/3EINm9ieHPK1DIMvgCsRELw7+/\
HDz2gQx/3r9kuOclzvDv80cG1RP/Ge7YcQB9xDuPidvWj4HHKZTh68ENQB+wMjAL\
CDF82jKfgZGVFWSKGNPXo1sYXnWmM8gvvw5UwMLAZenFwKFvA3QZ2EObgG5g7Pn/\
9w/DPQ9hBtHCSQysUooMf988B4Y9yO0MGTBvTgDifLBngYr///37HxgOfCAPAARo\
mtpZEgrD8HM+6njSjIYwgghpCEVqKQ2KCoqChprCBiGIppochLaoqTkwqD9QQ+2R\
k0OUNdRgjgp2g6QbeDleOH6974fCeeGBb3hvz/O8n10HZrRHiBFcsIdlodkg8YSo\
kj9x5TtQsyu9r4TUNGUmr+ReWIcxNk3+NdD4fEHf9iGq6Tu8R5eIIBmjaUdUE2Um\
BzxZ8gTdwODJDfThAN525mA+JnlduGZXYf0WoBlOiO5e0I0xR6YkhKxWNp2hRXgv\
c/DsnqqJ+fAI6tkMJZZoIxOlxDnykVF1MD3LG5RTb5NbE9T1o3J/jdetEFhyh28c\
3FDWyoo7GQmr+APnxLzyC+SVpCGt+GINAvR4InTKmgmHP0j8w+gY8MIITKoGzeIf\
zExKmV1OXUEYSmO+rynWIENwEy40R9dKPfeM72wa9A9VjqR19SEfPLFj6F4/Kg8J\
Lk62bq1kt7EdQUKEMEPoZ6cIBUh5S8qfqR9mi38T3DSScC2L7AAAAABJRU5ErkJg\
gg==",
        "ArchLinux":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAnlJREFUeNpiYAACLn0nJxDNIDbr7n+A\
AGKAA7fp+6+yCYmLAgQQXEB7/s3/cI7ETAhHbMLZNwABxIAVKJct2MwhKCoMF5Cd\
dvm/+LSrYG1MYn0n376ekefFxM7FwMjKwQwQQChamXgEBVTnXP+NLMYIl2RlY3Zd\
ff/Pz+9f/zF8//z6QJKxBEInFz+v2PTr/wVS+xeBnTn77n/xSee/giXZ1MytBHNm\
rWNkYWNCNppN08oW6J8/AAGE4gZ2DQsLBnxAqvf4W25pJUWcCoyWP/5vMuvsaxSf\
wRjWfTsu8v58+4qTT1CEg19YEMWb7JxcbAbzrv588Pkvw7+f3xi4/v14+zDfTARu\
Am/t1lsPv/xleJmmwvjjyKqeHyzcwsxi8gpgBcxCkuIsAuLyjOzcYCO/H1u7iJGV\
nYHHv6AULCA+5dJXdl17Z9QwZ2YQyJy6gl3f2QMgwPB6mz++fY5U0dwtDOQAIY/k\
HI0lD/9rLHn0XzG2pgOXOmZsgiIWXn7iVt4enKwsbOzs7CJ8OtY2HIz/fr+7euIw\
QQMUXcMi7Gpmr+EQFNP9z8Yl8vvPX4a/v34yCBo7OXMyM/x9e/n4IZwGCLnEpHLE\
diy8/vQ1w4sf//8/2bGw883Vk7t+yOrbvPv8nfmnmo0TMzsXx89rR/ZiOJvHJ6dS\
Yu6D/+KTL/0HJUcOI3d/mByrspGZxIwb/8WnXv4nPvXKG76I2k4GRkZGuAv4Iusm\
8ASVVDP8/Mrw98X9C99PbZ7/89K+bf+/fvwANuHvn58M////ZOTg5mYWklJhU7e0\
ZmTn4Pl19fAuRr7w6oZfd86d/XF2+2ZSYoldz9GVXdvWHgBzC9vbXVrvxgAAAABJ\
RU5ErkJggg==",
        "FedoraLinux":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3tJREFUeNpi1HQsYgCClwyaDoXv/gMB\
QAAxAkUsgCInGO6+/PHfNH7ef4AAYgCKmALx/xPnb/+3ztn4n1lMxfbyp09fOJ+/\
+sDw4NpFBoAAYoSacuHX7z/H2FhZspiAnP9Guor6v37+zmRkZPrHYBI3F2T6/2tP\
vv0HWvWfiY1HiOHUhbsMwbE1DP///5sNEEAwM3YCsdvvP38ZGotDGaL8rRmMQvoY\
frx7ygMy8zJI8ufPXwzhPpYMp4G6la1yGDhEZRkYWVi/MDGxsEkJqJkDjfvP8A+I\
mZgYGf4zMjJ8uHmC4f+f3wxM//78+vvn40uGe8emMBjpKDJs2n2WgYOdjeH/v7+z\
RA09GQECCOYGEJgGxMF//vx9DjQlg4mJ6QRIEOQGLpDfgDiTjY1F7NyODv0l00qP\
//37dxdIAQsQfwExvv/4xXBtXy+Dnmspw/f/bAxiOnau768dMQOZAHTVP4aPn76B\
7Xny4h0D2/8fDIzMrCDuXCZGJiYGQT13hndX5oIVvLs8l4FP25Xh/bVDQK2MEkxC\
WvYMHy7vYRDUSQYrENRNYvh4eSfQ0H8g7nomoHcYfvxjZpASFwQrEODlAepkgvks\
jeXN5QMM2xbVMChI8jMYeVYwcHKA7f7PyivCy8TCwgAQoErqh2UgjOK/9k57vdZR\
IWjUBRGhKWGUSEgMRiQSewdNrDZWi9iLwWCQEIOFiVgIBhFMJLSNP23alNLetcdd\
z/tOK7wvv3zJ9+X3e+/93vvrA2t3mTBTbh+6UcLXl26pe0QBiXS2pBW1NY7n5+hb\
qdjAIkIIV5TYWBg5shjC6FAQjy8Z3EUTSBUF+8p+NPweuw5rmcdVm50LM4GVctbf\
UFQNoekRi7ywtIX17SPUSm7QWFHTPgCpNYA3NTujF/M2JjBJKcGOXZAQ6PSh2Sug\
t1u2xPqDbZhSCnjOaIgrIoR6H9TkPfRCjrziJnhykfP4eyA2dkB9TcDp+LSMcgkO\
S4Cj7XK5nHA4DKgPD1Bil9Y7kdmV4nmxBq4GGYV0DLnoFS74KhzS1EXRibHhPpzT\
/m7uHlsm/jBtv1YRQryuZO35p1tIcgCz04PwcgoCXX50yI04OL7Bzt4Z3FTBvzDN\
Q2edb9zUP/NsjOS+OW/ohuipdqOlyYv3XAHxpzSqeI7BoFRJop0SNkxDPxGoYkkO\
4iN6iW/fTlSGNUJ0lQAAAABJRU5ErkJggg==",
        "FreeBSD":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4BJREFUeNpiYAACGRkZIRDNu5SB4T9A\
ADHAwXNVxv9FQBGAAAJz/v/5+f/LiV3/twOZLCCBA3wCDHLqPxl4J1R/BAggZiBf\
EAj+/v///9/fv38FGO4ePvTrz63j/5+vXPhfUkzMjvGOPPP/nw//MtwBKn3fV32W\
QUZJyeeMJOP/T44M/0HmAQQQAyMDg8RVHbX/b57c//0fCh7Pn/7//5N7/8uYmO4C\
5RmY/u2Z8ffbvm0M/9o2MZwDClwD4puqagzMjtbrQa74b/KZsYF9x1aGe0DlH38y\
MIAE9UV+Mcz/yjQV4TVWVpl4NdWNLTYq5w30xHNgwgABxMDAyCgIopmZmRikpaWF\
gYAFKgMWZ6hhZHz2f90imPv+f9y/7//75/d+3/J2A/lCgEGUm9v1/+9v//88ffz/\
98Wt/9+dP/f/i6/9/9UhIb9ABrCUZGcX/f/6gOGbrg7Ds3f/GC4DBa/y8jEIeTuy\
ApmMLLy/fki/MtFi+PiOgeE2UOQHEKt9/sTAevokyABOplXXby2++xBolCoTwwOg\
CDcQv2ViZAjc3AFS8A3s0AXRkZ9PcDH8P6PG+P+pBdP///ka/0XExN0YkIGOvFxh\
tYbq+Tw/6fVAq6Vg4gABxggMPNE0Xp61Dr5e/Fsf3Vt35vmbg96BIda2Nja2UlJS\
Mv9+//r/8tXrR6fOX9i3adXS08aKCu6eAgK+29ZueLnw158QsCEBXFxzdulp//99\
/y4oXfz/9/3L/7+fX/3/8/nj//+/v/x/c2TP/48ndv///+3L/1eRgf9Xc7D+9xCX\
6AUHEyguf9o7XHOc2v2fmZ+D8f/7+wz/Nq9i+L9nG8OH608ZHn9kYXjPysrwWUyU\
4dPjBwzfGZkZNHu6/39bv/kew8sXoNTEwDuvvPRo4Ltduix8HAzf1pxk+PMQkpwf\
gxIhEL+B0iDFT4Ce5hUVYOBNiDpT0DXVngko9vX+959Prxx8xfBi2UmG35xMDJ/4\
GcFBDkp2H4EYFGKqQAxMaAzsQKPTu0MZPvGxg8z/DjKUgYmNTbo7J/eQ1vzZSqK/\
PzGwCTAxMAIj7PUfoNzX/wy/QSkLaCi3wD8GKSMHhjWiVjeSWzocGP79e4kSVZKy\
sn6tHm63TirJ/78ryvX/tizH//c67P9/enH//9Ks8X9ueeh1YVFxT2Q9jAy4Ach7\
PFD2ZwaUfI8AAKFcdGnejqM9AAAAAElFTkSuQmCC",
        "OSXMavericks":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2dJREFUeNpi+P//P8P3799vMLx58+aG\
U1ndf4AAYvjx44fkt2/fGFi+fPnyjAEIAAKI4fPnz5LXn93//+PbNyD+/p/l0KFD\
z+9+YGAIcWRnYGdjZQAIIIbfv3+DTFkPxCUgExk+ffr0/8qju//dO0r+A9k/GIHG\
/2djZmb4x/Cf4c/ffwxMIIMZGf8zrNx2guHDhw8zAAKIAaQPaPfE70Bbvn79Csa/\
f/76D3TG/3///jEyfvz4cSdQkRtIZ9PutQya3KIM8Q5uDN9+/QA7k+ndu3cnf/36\
xcACNPzayTcMYVZ2DKt2HmD4+fMn2IXMvLy8+9++fdsmIytXHmBlwPwLKKgiL8Xw\
7NmzWfPnzzcBCCCwG0B+B/ojH4ivAfFmoG45kG6wv0AEyEF/gA4DOfALEH8HBglQ\
4XyQHBMwrD4wMzIxuC+sYWAF0m8/fWC4+vQ+yP4EoEYVRqBf/4Ncy8vOyTDp8HaG\
C9duMExMyGCAhAfjcZY/f/6AOR//fmE4cPomw5zUJAaYGFCBBBPInr/AIDxx7Q7D\
rNREhviaPgYuDnYGYCCBHL+d6fnz522sLIwMtx68Zvj75y/Dyp4Khq5Z68AmAL2a\
zSwgILBPSkqaz8ZIyxKk6/fvPwwmukr/Dh48yHvkyJHfAAHapnqQhqEgfIkvrSk6\
ZNEudq6CIF3ESV1EUfB3EwcLdaq4qYsUBMEf0EEXkUgHkQpOBV0qODgotLtLyVIQ\
I9i0prFN03jeixaKeHDkcrzv3rvvuxO8Xsn4vfTyOIVb5F3wvxnk+5Ik7TLGfjIk\
JCdxlXPl1Op4+pjGy1wG0XE9QbnzOJ19wMPbFNZrtpcjTIJLyGdunQRH7qVyCb+q\
dbzK3ePc+Q5WKxY2CLB4tI3q3Q2i7SCntXmeBm5PMAzjmdoIt76TiSLY1FI0eQbl\
ogEX8TVQOjrB+aW3aUSzJlLfr67rQqv7JQYn6Qz0Kz0w1TsIB8lrkGjc/p4j3oqi\
pmkxCmyeoMGBkmnB9OYxDPeFYWN2AmKTI7A0Pgpjywl40d9BFMADkyJYKBRWBFVV\
+Q+LRCKpUCg0b1VrEPBL3v60msTawKraEJDbQdf1DMk4Q7hPRlV4gYbP51vI5/NA\
34FgMBhVFGVIluVu3iop9VYxK1kCJs0P8wlpJ2lZvcLf49k7NaXQhpYAAAAASUVO\
RK5CYII=",
        "Solaris":
"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\
5NBCn4nqAAAAAElFTkSuQmCC"
    },
    browser: {
        "Firefox":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABAlJREFUeNpiYACCwkWnvzAd9BH7+Ovl\
NW6AAGLgkipUZGBQYWBYq8jwPzUx/j9AADGIcjFpPivk+59x6Pp/t659/xmBethu\
Z4v9/MgkzKBs95gBIICYQab4Ne++8pfZQurdvW37GF9US/7f9d+d4bBtPsMsHhcG\
pl+/mBhmM0UyzEuoZGAQf8vAeFaN7b90CDcDw19uhqqrT3YCBBAjI9DYAAfP/b9i\
6hyUfl9j+CFvxvD88CGGzZFtDAbuz2QZ95dp3ZT/9VaNhZWZYZVaKcORf9oMG6et\
YjBz8mU4UTWZgcGFg2XWw3Lx/0+Suf/P0ef6byNv8J+BweT/yfkS//+/SfjPAAXO\
axgY/u/l5/1/VJfv/71C9v/l3ux3QRIAAQRGLIzKDCqB8zvq153/4tew8xITW7os\
TI5pRYbaAtG8/v95ns/Kv4rzcn+WEdFd03L20YY6iaWcbIwMzHn6TPMqODdy8tw4\
yfCWR5aBQ1WF4cQPWwYd3vO6f34yv2NSluIU/MPExqCpwM5wjM+WYX7LEobrR84w\
/GIQYCgKfl7O9OfXb4bLh94xtLwOYPh36QaDhbocw5WlmxiCJc4DXaDMyvLt9ncG\
HSt+Bql78xj2nd/MUHKCjSHYVIGBRfQXQ9+sLxsYLRkZ5s+LEktgF//LwAYMrDc/\
RBgEvz5kkJsmx8DIdp0b7JVgBoaLB7g5/u+XEfh/3oPr/+1JHMCIZQwEyQEEqJJs\
QpsGACj8kib9XVMba+cytg5RV+lYmdOdNlSm1IldYfTgZTAUHA6vInhxZw/Sm6Io\
7CrsIqgHxT+swyIO0zI7HWu6OqmNzZp07brmz4B68J3f48F7H0FaX5wa2ufPl9wN\
seviTHjqxM1whOOCLgNDh71oqUA2/wuO9ddo5tKlysqX+Y9fsw835T87ESSw90WS\
XT44Mtzz09UNt7IGWW3i3ugCdDiwLUro7dkDuVzDm9QjzJ7J4PpsEc8Wtvm52624\
7Vps/434iDfeFjfg2SqA3pHgbezirMKjqihYd4ZQyAn4nOYROX0cZX8C8ocaLoyW\
OlVfu4tYunpA7O7YCZg6AaWqYXVZAX8sic2BcxApDjRN4VvmE/iXb0HrOvp6OTyY\
WcJYQkfxsdikMs8r0tSEO2BYRq3awADbwqDxBIJQQICUEezYRco8Al74DtX0YXqa\
w1h0CyiQeCX1rxJ2i8j7IcfiyZibMf00TKuFtiBMl1xI5aLYkEJoKVmcD1cwP14H\
E/oBdnICQn1Fiw4XE8Rf6CKXKCxe9tv6VZYBnBqYQx7YvSRcjHUYBah6E55wDZ2T\
JO7eMspXUmbSyqUJ/K+jFsdzMadtfNBhD/pA0KSFQp012nnaFJ8W9XdrknbH8r3/\
F/gNf0qApDnMDOAAAAAASUVORK5CYII=",
        "Iceweasel":
                "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAYAAAG+URWSAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA8JJREFUeNpiYACCBesOHGYxNZ11//FZ\
YQWAAAIJMBg4hMWw+Ngf/P/oASsDQAAxgkR6W6/8l9T4z+DsIM/AJCgjrh+eLsvw\
9ycvw8Tp978BBBADDCzYdOoyNxcnA8OzV9//79j8+P//f//+c3HzMjC1dR5m+P2b\
kcHf5QgDO9s/BiYZTh0Gn0BpBmVlKQaG/ywMAAEE1h+RXFz4Hwjef/nz/9fv3/8/\
ffn2/y+Qf+3x54eMHAJiRreuXzm7edl7hpcvvjJ8/vSHQUzxPcPsBdvWf36zLIjR\
3HL2PVYxaUUbayEGOzUFhtXLnjC8fvmH4flTZoZ7bx3A/mAwc4vv3brm5/+Dx279\
v//i6//zD17/5BNVkBIVFWUACCAGVMDOuuXQjZsz1h27BBf6+ff/3+9//v//8PX3\
/01bt///9usfyL3/mf0jEmM2r2QIZvrNzvD47hcG9wATBsa/PxkSsurKGGuaj37l\
+s/AxcMpyPD2zQ+Gx0+fMLx6Lsiw5ZAtI/OXZ3Gtd65/YpCU4gViLobbV/8x3L3x\
jYFZ4M4jpl8fOBgUI/8zCEqxMcgr8DG8fQ10FjsXw3+Gf/+YJNS//QjQ12YoKFBn\
0DbjZnDwEAcKczD8/P54BwMTOwNDR9Oj/1s2Pvp/7e6L/3df/vw/YemWrSBfAAQY\
I7IvlbXNTOzsHZ1EhAVExcSlhDU1VDXdHC0tWJkYGH7/Y2AA0Q9efvk7d8napZdO\
H17LAtIkKquqdPP61RuPHrxl3b//CYOoMCeDiAg7w8eP3xlu3nnJ8PblHQYTE1OG\
k5evMrx5/oi5uTg+rqL1620mkOa4tNji1y++sE7tusKgJiPB8P87O8OrhwwMv95z\
Meza8ITh/pMPDCuWz2PgE1Rl2HTk2mRGIJjbX9PCoqyVOv/NDf8ERu7vDPcffmSY\
PuEug7WDMMOvn/8Yvnz+DQzbXww/jgowuHhoMpTEnGN4/904h09SeNa/H3+vMGuo\
Vi68dYqR49Dudwx/GdkYOFhZGeTkeBhKazUZNHUFGa5e+sJw5+Y3hpvAsP/w7h/D\
z6+8jIz8V+//+vLwGMvXv3vX8PNnJEtr/2TQdv/H4GQgzyDExcWwat1Dhqf3gbZ+\
Z2JgZeViYGJkYvjz6y8Dr9hfhqcv7x5g+McCCW9VQ7+a1Mgn/5fPe/d/6fI7/2/d\
e/UfGTx9+/X/mo3P/q/d+ul/85QVa0CaREVFGJCjillWTS8twCcn1dXRVVtKTIjt\
5dt3DOeu3Xi//9i6fRdP75n59vH93TDFoPQMAHklqCYxF7qPAAAAAElFTkSuQmCC",
        "OperaPresto":
                "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAYAAAG+URWSAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA8BJREFUeNpi/HfnOQPjr/c7GI442Lz6\
//8/E0AAMfz/8MHs3/pVDAw73JxPzRLg+w8QQAx/1622OGlv9xMozfDa2+s/Q6EA\
P8tcFtb/IIF5XLz/AQKI8e/DpwxMv39u+f/rR9f/aycOMfytKAfLHtTX/XY1MiSQ\
4YiOJkiAcYO5ybFJYsKvGOZx8oBVzOfg/B/JycIBEACEAHv/Af3h3AAB6O/QAdfW\
L8P29FkAAQH8POfoq/8UEuABDAMhBPiWl8j41tkvzfX000W9v6kAAAAArzMwzhH3\
9jLrBAXWBJ+pqtoJ8fI3ERoaDAAAAP8AAAAAAfH0DNjm6QDiBQDdASwFBAAiBQI0\
TwAGyxYgHfP/BgX+2NrbD7T5+Tzi///FAgDoABf/Af7b5wABEwcAAPb4gAD080z/\
/fy5//TyewDh1gAB/eDeFgDJzOnGsrHrFWhmQOmMjr08Li4YASQaJgH9kpH/AuDh\
ANtSUSslOzzZ28PCIRqQj9vyAwMAAfFVU//78fIACK2tBgsMDf718fH/0jk2/ff+\
/QAE29vaAPLx8QA9CQr8AAAAAgYHB/7X4+QA/gICAALY5+cA2urrAP719QkAAAAA\
/fLyCPf5/gAC/AAAAt/5+8j//AIA5aCfXAAAAP/wtbNXAQICANcB/NQBMAYFAE8F\
BdUd/QAqKkM/x8a+vzniAADbt/r6JgLUSDWtTURR9Lw7MziJSWkojfWDoESsaLtw\
4U7cuVFX+Q+6UHCpdiURdy5EpH/BhSKCCCLiSm0iCF3U0cQkDbYltpNO28nHZGbe\
vPc6I8nd3M0953DOuUw2txM2KBPHaNRfVp3tEhyHNb5X4XRt5LJTOLe4CHY0DWQz\
HyGCu4r3WiAW51D9AhaEb1StWSLPQ8eyYJ04fv9a+fFTjOdz+dG9s5Xq81OFAriU\
wFy+IpW8ysSLZ8ui3rwj+wNQGOBrp7Nx6dXri9P5/CDGaYlHZ2srVbl5fW0hmy0m\
EcVwbGr0Vt9YWSnRjo2Qc/BYOZqdtdO53DDpeSxMmZmZkUiZ9mqzUYzi8KUQGJpH\
rug/LMtO9wdzQRQh9H2kdMNgUaTBMMQYrJgQTHm+8W/PBXQDRsy7H/B9suzdh5sH\
PdiOi25vBK/Vnh/Wamcmb5bsUb1eUDv2+cRFShGSNluhX6YDz/vwW0YLQ2LdadLR\
dwfm6u1b7/ivn0XwUKj2+um1pQfv13f3MqQR/jLufpP+ZU+KlxNf/ydD7OQ80dIF\
0m5MCZFjSpgeMd/Vjd4fIT81ePTEB9qT+0N3etEwZVJ4mAAAAABJRU5ErkJggg==",
        "GoogleChrome":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABBZJREFUeNpi+P//P8PnjMifLN6rfX9/\
kcphAQgghhJ/P4t7T58yMGzdOOn//xsM/wECACIA3f8AYXxlNeUiJ//yl47/7n4X\
/wHPys4Af/J9/+33+ADEIssAAgBEALv/APL19QDZU0nfmzkznf79/QAB0ywp/x0p\
LgD/KrkA8PL9/wFOvkv/5LxnACEVFQCsRkQABPr1/wAXQpQArB/AALnAQYwCAIQA\
e/8B4eLjAMo/QbhBFBBHAQwJAAEEAwD++vsAB+/0ANudnAsBP5dB4hMhCR2XlQkA\
akt6AA8IBQBLJwkAUhEoAAAACQAC6cvqufwDAQBhb/MAOhX7AOXf4gA1FJkAAAAG\
AAD6BwAB+Pj4ANbX1gZnxWrwERsRCXb62gA3EvQAuNMmiyVDlnYCAAgB9/4B////\
AEJKSgCMIBudI/rwXPD6/uaT8/1acpeYxxoYGAABv7W3CTZ4ePb2DgoAAgkGAAD/\
/wD/9fgAueXquVri30gD8TXd+UbC9QH98PIACF9hAAcj4QD9HNgAKDP9JIqyyrcE\
+y0TAtYR7ADrl70AudjzAPD1PgCtVGUAAPnVAFjVwa0EAPr/AI2FHgANyOQA5vP1\
APT3+gD6AD4ABgDVABoVBxgC/v0AAAMHCQA/P9AACPv8AFMyGgAG+ZAAAAAAAJqs\
86ADAP4CCxMsETvd+90A/R/EAE4TlgAmCPsAAPIGADJe7TMCsX2uduqz74vz7fkA\
/u0DAD/v+QDm2RD3u++sBwcFAwAC9Eg+IVFFURj/7rvvjyMzOo41Ig5EtCgVUZGE\
FgqJIIYJYVG0sdB0RHDvzpWSLsQMEQpKREF3WQvpz5BQOUNJG4mhRTAxOsWYjTOO\
M0/fva8zD/LexeXAOec75/ddh4NN7TZCIddmf9/EHZ83WF7mMZi7GDYlAAxMSnLx\
BDlTmKv76fmp5N7oRjicCxQ4dd7sQWXk/cxjzT+SUiidK2C6CgiLCmkBxggdxVKD\
PBGwaQ8jf4xI7aXZs1NjI2xgcfDZ98DPe12vUri9lATXJIzgA3zuvo9otgAeqCk/\
QqtnHGpmDpwbRIUGs4DtaNsC61y5ZvFScMvD0fg6gSDrwdiFDuwkDuAu0h1aGUIb\
KPNhvuM59Ny084sIHrJ/vEK1UiLO3Mo5PS/xtcWHuZLfaNyVWP+wC5euOHzy5NWN\
6x7y5hMceUaPzZFIqnH28MlkwxvX2y+GT6XpaF+6wrZQV1qN89pFHBOGtLmF4ZIl\
eLVCOwIlNPzdKRLrsaHLLLIZRsvVVqN6qHa1qr2qm0ESSBJRGEyboUakMF0RJWFJ\
Y5O0UPBoYe/lu1jXrRdra6Zj4//Te7cXh+5s05kr/v5vRz/amtVsoA+/kLZ5/ON2\
JhTL1z8dHV/eqvR7T2v+AbCooSre7dBxAAAAAElFTkSuQmCC",
        "OperaBlink":
                "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAYAAAG+URWSAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA6BJREFUeNpivGVlz6BspPuKhZGJ8e2D\
S9eFAQKI8Wdunvub+492Mj6wdnjLwcQoBBBAjPd9/E2EOTlOP/n0mVGel/s/y8nr\
N86Yc3IxfP32neE1BwcDQAAARAC7/wHoUlUAFRkX2fwFBYbjztGhBA4CAP/X3+IB\
GwsJ9QgVFA4E8unsAPHr7QANFRTICQUEgAT77vAAEAIDAP3u70LE+/kiAgCEAHv/\
Ado4PQAZIyDYCQMCJ9bw8mv+/v7ULBIQwfoAAP/j3eACBAIKCMn77e4n9gIC7gX6\
/JYPCQgA7u7wvgT8/EIQEA/nBPHw8b4HAQI2/wIDAgUCAgDw7O0ABwICGAYBAAD0\
AwPmBM/v73kOAgKuMgEDygEBAfwE///8/gAAB/MKC1XR8O+sAjA49yoRxGAYhd/k\
S8hCdKYRLd0VFbET7Gxs7WwWQdAb8UYEL8BrEER7axVhEQds/MEwupNsMjNJnPrw\
wGGzg0Osbk6gi+VLIn7W9/E2xHT+8fj8KzKwoVl+dcakh5fZeG9n+74QvCaljtl8\
ehIpJ1757jQ4dz1SaryuR28ggoiN5X3OYH26WRISWojKNw4MGaJtLPJwaL4NlJRA\
WYCGkAcguoVHyglrZUkxRrTzRnbEBwnwd+vuOh8QrbuoP78QrD1qvUcdgmFXky3s\
S/VUprjrYv7TxIsF8Z+KsZV/AVqklpU4gih6bz265tHtMONMogZmJcS4CVn4DyFm\
m2UCgossQtauhHxC1mY1WQsBQVdBmEA+IGiyESUBhxEnHbrt7vSrqrw1ujvcR51z\
7il0qQMidJYeLPuB/6kh+QvUBjRdLSI9raaCJmFDRFrKs9lk+j4N/x0h1YQlkZ0F\
/6Db8F6aIgddc7iIbj6HSfImoVTbgQ8tpbYfP+zvsSxb7fvtw1ar+TuMkw08f775\
YaC8XefOmag5T2Mm1gn+qcsSbFWSYWj7Uvxc4DgkDIwGY2Dfhc3zdyUNGeee5Gfa\
FJd/w4RuBcrzoNftAlqb6qo+o7sNaRfuempN3CTp1Jeyp+28DJa8tD1FAEAK8uXY\
XcMYKHU9n3EKq7I2IsyLt0FVj4ULxi0j9hTwZwS/1mkOCeVEP+qRYrjh8rL3CieA\
H8Uky75dIT59IuVxx9qemdPDfq7Nq7yqxg0plj3O9w1i4FYZF+aX0Vuzqhyxgl77\
b/SP07JYvEQWcCZeR9aeVtZ8GXjeNQc4ibT2BRc7MZcrkRCc2EeMOG4BudKfHxDh\
D1UAAAAASUVORK5CYII=",
        "Vivaldi":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2lJREFUeNpi+P//P8Mvf/+3DO8tzN9+\
v3L5P0AAMX739Hr7789fBoYfly79P6mt/R8ggBjeW1u8/Q1U+Dci4v8/IM3y/+9/\
hq/W1gz8R48y3Dc1ZQAIIMZPTk5vOXh4GIDSDGybNwkzsa9ZI8T0978QIyen0ClT\
i/8Mn+zs/v8B6gXpv29u/p/p35/fDN/mz2M4qabKIMTMwAAQQIzv7O3eslhYCLG+\
fc/A8vEDAxMTE8O/r18YfiUkMDBMmszAxPD3DwPDtasMbLNnMfz19WX49/MHw5+v\
Xxl+qCgxPPj5k4HxHdALQF1CjECFvCdOMYDA/b5ehu/LVzGIMDMyMII8+9na6j9I\
ggnow88/vjG8ZWFmEGdlY+AAKgAIwBG54zQMBVH0vI9jJ06qIFFCmQ4WAB2fDZg9\
BCQMEp8OsRXYBKJwBYIVgIREoEJEgThpEonn3+PZmmI00ujee2aaheXefqr9Fkoq\
rKsyL8gzQy9J+mKxtW2JY1q3N8hu2ABn62vY+RzzPprJamWV4CCi2N1BoBBViT6O\
MYdHfP8tkXY2ppj84J+cUk5/sVmOmKZ8Dof4QqOpwEQR3uMD3N9RjD5IX19oK0Xg\
NKWtqjoWJknQ2sMfDPi6uqbjrNrSkTXgLpg5P6vFeLu4pNsJCIVwk0XXXdRXcC9b\
bG6Apwilbix6T8/9fwHapHqeBIIoOLsH3B0QEmMhv0ErOkzsBAvt0BZ+jlZQavyg\
1EI7rCEoDYmdtjRiFAjBeFHw4Lw7ZxelML5kq/f2zbyZmQuV2wylIseFkbgNaVmg\
KNzP3+zrRxR/8onAdREoXGqWqNeFdDbWR2FqiWG4hnXbRHCwz9lAf1acjZhJgw0E\
sRjC6hmsmya8SgUDLhoyCDKgFOg9YXZ5pW+IZTIIT44RWDZ8Gh94HpQQgsIbDIWq\
wfkF3hiI4fSLOFRDmCZQPYVLdHW6uZKGODqEu7aKqePAfXcwy+fhM8sPxSImjQZS\
tqVVXKRJ3SS8GcAhu1ymQUIv+y2PWb0vlSC7z0iaEcSV74Z4lYsJMgmpbNhqYVwo\
6MyGP62PTgd3uS0Yj10kKK5NUZVNCiSCvxWNQrz0MN7ZRri7h36vj2GthlSUqOwl\
yTTOGEsx56dtVNXPZkf4p6SOg4BLZ3zOWkJqd9Pt9rLqfwOfwXFY6uCaVwAAAABJ\
RU5ErkJggg==",
        "YandexBrowser":
                "iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAYAAAG+URWSAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA1NJREFUeNpi+P//P8P3798/Mj169Oge\
x8+ffAABxPDr169okCjDfx6O/69evXoGEEAM/6ZPLfg/Z/b//9zs/38XF/xnAEn/\
dbT99+njx9+fP3/+DxBAYAGgvg/f/v1LhOgV5v//v6fr/39B3v+f7t1LZfj39+//\
/6KC/3/8+PH/5s2b7xnu3rt38z8/9/+PHz9eAGkBCCCG/+/eCvw3M/r/C8j7B8R/\
rl/7/1+AByz1/8MHPsYX3749FefikmKQlWRg+PyZgYGRkeHPrXsMH5mYgHrfvmVi\
+PSp5dufP18Y/vxhYODiYvj97hPDNza2T39+/z7Mx8c3F+xMEH526tS6/xzM//+0\
NP3//OXLbpg4QACeyF4FYSAIwsuJQhpBRQtFRUsLO0vBYCfYCT6BqGAjvpE+h4iN\
j6CFhUVAiyTgD7nkTC7jGsGrjpnhbr/Zf0AptWWe2JNyHwGpnzkc7PzbFZpRGAZ6\
PGKL873ugZARQLPGKlvfe44nb7fgbtagkP9JGslnk0YwneAVx7AsKyJPKYnVEiiX\
ALObPM2lKF7IRdwdx9azOSgIiMw+Kd9HGIZnIURRGIYxcfMFl3xJdDrSW2ubtTSz\
LhKMZxB0onrljUYV3uMh+Zhf/SNA2dTO0kAQhCfRkJekkGgM+Q2ClWAvilgoBixM\
4wOsRfwJIoi9IiiJjZZ2gkVEUQsfAdOIXDQxiJC3uct5e5fb3Dh7h4q4MMXOzszO\
fN83zpyMea3swwQ5TwQrVNYejXOOBgVoZOrdLX7ubKfxIDWHjUbISU4lE+hxIcYi\
2NlYRwLo9xwdIkb7HFxCARQM25ML38X5GMiZ+2P7Ih77e22MMD6N2ON1fIJxkTAz\
hezqEiuKgoVKFfPF4im8l0ofrN3muLyE6AJbUHYxganfg7g4j8g0W0ItSqxWq4ww\
rkuSxNymrl/rqtriu3scpBxAh1RiWQDhMMDmFuB+EsyubjA1jZuc1wiLJ8uyFIL6\
2R2NRheasnzTbDZrWjBgQGQAaG8A6nWAQh5YpwO6YegkmjcAePT5fEGiwh+LxSZ/\
VEXtJHLl8ou8uuK0L2YdGUY1J7GWaZaJhRaxwRVFWaOf/0ry2yyxe2fpcRwazBKA\
Bs7GM2bxdZTa/Rf7BaMMlSlrMZt+AAAAAElFTkSuQmCC",
        "Chromium":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA9ZJREFUeNpiYACCmOZ1b1mKF57/9Osb\
Ay9AADFwC4jKgkQZ5u++8f/yk0//AQKIUURaSV07tPaGg5Eyw+cf/xgYQbKNG+/9\
//XnP4OfoTADQAAxgwT8C6acFpZU0H984/Q2RqfiJf+FeFkZpCXEGPh5uRiY3F3s\
GPgFlBm+/eJlCLLVYGD59JudQVFFhCHQSJhh2ZotuwACCGyopmviDH17/3QWpv8M\
jIyMDL9//2H4xcjOsLEpVIAxc9LOy/KqmjpH9u1jMDO2YmBlZWJQEedgUJPnY2Bi\
YmJgunnu6NHfv/8yWDk6MXCy/WE4cfMZg6wYB8P///8Z/jKyQNzNyMTClTn77Edu\
Hh4WbWlOBglRfob1yxdtntmQ6QcQQAwwYOQe0xDVuOZVcNnsq0JSSgYwcbAJYW1b\
/7P8+8nAzMzE8O/ff4aff/4y3Lt27tC5lW32zCULTr++cfse19tPXxkMVKQYBPi4\
GTg4OBnU1FXlv7x6dImxa9ez/+vXbWeoS/ViOHf/C8OPn38ZEt1kGb78+Mvw9fv3\
Lyy/fv1m8PRyYjh+/S3Du8+/Gf78/QeU+MPwD2g1CxsHD9PvfywMbCxMDOa6EgzP\
Pn4Bhi8TAyPQLSBw7Njx48w/f/3hkdYwtXr77Q+DtLggg6IEL4MYHyvDL2ZehmBr\
VUXmJ9dP7v75m0FIQtPK/MvXHwwW6sIMj97/YQgyk5X9/fP7R4AAY2RAAmoWXrlG\
7tH1/EISwgz//wG9/BcSFoxMIILh65dPP68e3TLj8p5l1X9///wKDydFC78SJfuY\
boa/PxiYgQpZgG4ERcWff0Cv/Gdg+AeKFiAb5MG/QMzMzsPw9MKepff3zY1hdEuo\
6vZOKi25dP4iw/kLVxjYuDgY7PQVGOwMtRi+/mYGh4YgFzODmAA7wydgEHJzMDNw\
ABMEDzcXw54d2/Ywli6+8EFQWIifg42F4eqN+wyijJ8YZOQ0GO69+MzAxQ5OsQy/\
gekXFHAJ7goM3//8A7sOBP79B7r2/ZuXL3kFhPh/AuNDWVGGQV6Ek+HPl68Mlx+/\
Y+DnYgN5neETMITNVAWAyY8BrBmUZkFGfPzy/TujsKy6aUzz6n38/Lw8rCwMYP+D\
gkZWkI2BmxUYDkDbfwL9oSDKycDPyQIMC1DY/Gf4wcDGUJMdlwxNrkwc7pm9awxd\
I73///4KDMj/QIOAtgCdyAr0hYuOIAMLEyMDMPUw/GflZTh5/OjN5qxg90/vXj9E\
iUYQEJRWtdR2CM+Q1rSwF5WQENWSF2D6/OHDh5uXT585vHnp3Nvnj2wGKvsLUw8A\
AZZoEtNTqkYAAAAASUVORK5CYII=",
        "IEModern":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA9RJREFUeNpiuPflF8OCB58YmE6++8mQ\
cPLlf4AAYph0+wODyIZ78xgZVt/5z/DvPwNAADEef/Odwf3w8w+8rExXnn7/Y80U\
dPzF/k8///IzMDCwAzEDQAAxPvz6i2Ha3c8MP/7+V2Vg/M/NcvPzH7HO6+9egmSd\
JbiAhq24/Z8BCTAddJZmZWAEsRgZ6nSFEwACiPE+0CVANsOCh19U6q+8uw2yGiQQ\
p8AbqsrDeokF5MIdL75VL7j3qaVFX5h/4cPPn0JluBnarrwHG83y6Nsfw8WPvjQw\
MDOCTOaPkeP9pMbDypCsxBf2l4GBmeXqp1+uPXrCaqfe/7Btvvb+KtC5vAwM/xly\
VQV8i1T5twAEECMoNN7++sew8vEXBi6gKTysTAx7X35Lv/Hpt9Z6a4l8FpCDOYCO\
Wvvky677n3+7guwRYWe+O8tETGX3y++GTG9+/mNwOPjs2f1vf1y52Zk+iHCyXHvz\
+59y0JHn//lZma4yXf38i4eNieEnLwvTRythDkERdiZtB1HO+SBHA90XxnLl4y/n\
5z/+KgDdxbD7+Tew1278/8UAsmrpoy9+kHgBuYOR4UuDjhDv97//GXhYmAxvfv6l\
4iPJvZcx9PjzylPvfiY8/PZHjYWR8YcgG9P91z/+ajL8+cdww1eBkekS0IpcFX4n\
RS6WY3/+/uN4/f2PpjQn87mjbrKMzECTAQIMHA4gAHQTwyugj04Dgx5oGpD9R+fZ\
9z9OQBuVX//8K3vr028HTlbGz+ZCHMuEWZnePPr+V7VUnb+S8c5niAFcwBDb+eK7\
TebZ19t+/P3HC45hsOtBBCMYgZl//zFEKvF12QhzTPj85z8/45x7HxnYgdYDfdz+\
+NsfWyBWByY5EV1B9oPpyvzhlz/+fAkMQoYPv/8mLHrwec6v/wzMDP+BAcHK/GGW\
sagS48HX30A2MJZffrv2xKvvgSC/cDIzvudgZtz47e9/ZlZGRqDF/xmAXmEAsjU+\
//lnCnYyMNlp8rNPYbn9+Tdj4/X3Jx5/+W0GDgigQi5mpk9+UlxrgQmHGZaS/wEx\
0ODvzIyMf0Au+Af0EzCmXzN6HX7W/ODbHxdDAbaNS+99bmcApR6gAgkOlgvektxh\
Mlwst0EuuPflTwAwwa38/ecfG0iei535xwoLcVlGwQ33TtmKckyIl+db9vXvf5WK\
i2/WP/v2RwfsGnAYIgUiKLcAnZKlLlBZqSHQAUoUjIdef2etvvIu7dm33zxSnKzP\
5blZ7ijzsJ4B+lUVmFps7n3+LcPNwvRVX4D9shw3ywFpTpavwDTBoMjNAg4XAOlX\
s9jxK7nNAAAAAElFTkSuQmCC",
        "MSEdge":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAtFJREFUeNpi1C3excDCwvSaiZmBmQEI\
RAACiNGwdI/cP8b/j1gYmBgeMjEwMgAEEKNe2U42JgYmJkZGxh9AJf9ZmP4y/WJk\
YfwP5HQC8T2AAGLUA5rCzMJ0huE/w3mgjlQmIOf7/5/M9v//Mz78/5/hFAtQJoWR\
/e8XBihg+v/3/1Iou+r/PwZugABiNCjZy/Cf8X8yExPDHKAZf4E6/gAl2UEq/gPN\
YWJk+u//+yvrXKiu6UBF84H0AhAH6LT/LEBFG9l4/mSCpf/9zwUKQpT+Z0gEKmZg\
4foI0fmLi+HiX3bG//9hroGoYwMIQBX54xAUBGF8ZncrDREnUIi4gbiCWqKRoPEq\
F9C6gYROoXcMiYRS6wYaonxv/IZHYpPJzHzf7jd/Vn0bUYMDS9wU8MatEfz5rRA1\
isbfwzvWocqJGhvQLEjMd1Jon5oLfJXRyiZ0Zrk2kxZhlZvMY5AqW1irt2dS+E4Q\
zxLhMSYblp3/HUo1kgVF05zcAky+pJWDoFC42IFsTNQG3MO2yAdQtVR58K8mvWfd\
rpBdcfu0efHpXwLUTcY6CQRBGJ7dI0cwQk1nQnKNMTF0Jj4DhfIAFD4E2lBYamcp\
b2BjLIyVjR1U9BTGhITwAAfB43b55rgN0eheNjc3NzM78///FjgEXKy1PZwPmA35\
ezlGvyf2ZteXHo6FZBLVAcnK0Zh9lX9HZ9DUxG4R2uedFfEG21AoN5cuI5fkLpp8\
ZqxTytcIPgKnJIo3I4SwIPiTfQe+xz8QivyTModazAsEnOQr1ComJTihq2vRycND\
dYKnv8aBZH+O/N2m+KrJhbZYYnxLq3QlB/L/0ps0r+RrG0j7sLELShsA1oyjh4qu\
Cdy54l+V2A7GG55UQZFSwmO3tm1OT8sij/i92XEexvD49H4O9bqot1Jfuj0wXiYr\
L4dZbBrWOuSFSEXa5ShfohIXeSf3FfqWmrMF26fqPqOWptkAAAAASUVORK5CYII=",
        "Safari":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA6ZJREFUeNpiYAACEzPzcIaoyIjybb7+\
/wECiAEGGDXSVv330JNgAAggMG/BulP/L918/n/64k3/WcACTBIM/zl5GD6JqzAA\
BBBYBQsLCytcc0xs7IxtB679P75g5X8Qn5lLL3WzkIY6w19xWQY9FYk6pngLhmec\
fN8ZDnLwMHS3tUgBBBBcq5uba9zl63f+3nv88v+GzVtugJwCdo+kpIScY0jZQyZu\
WQYFOREGJyUuhj33vzGw/P3PIPj7/F4mfj5+BW4ZWYYtTGIMuhaKDHekVRhuCEsz\
NJ3+zPDt6xdluBVTJvbfuPr60//7H7/9v3jzzn8VFRVnkDhAAKEgY1PTEHZ2dk4G\
bGDNuvWX7z568R/o0H++vj7pMHFmEDFzycb/wmJqYv8ZmRh+/vzPqGro5MPH/lvj\
3Nmza5k72lvX7L3KpXX35ScGGVlRBpaWMobj/BoMH3+w6nx+eWMNs72Ty2JhFUNm\
JRUphqdPHzI803NkuPnhH8PXr38YDBXY3jD9+v711voHPxhabv1kCDCRYhA3VGfY\
9pmV4eWffwzHjh47w8jGxsbfu/XMh9vMHAzKStIM3Az/GNZd/8gQ8nT7+6SUVCGw\
S+Xk5KzOX7/9/+6Hb/+vAcNi1vRp92G+AAgwZmxeZmZmZtHW0jKrqKpa5uvnn/Hi\
+bO7r9+8fvrv3/9/6GoZkfWlpKUuCo1KiuLiFWXgZGdlEOTjYmAEqvj49RfD1y9f\
GD5/fs+wdf2yjdOmTAn/9+/fT7gLdHS0bdv7pt5//VtZ9+dfToYHTz4wPHz2ieEz\
UOO9tz8Z2A9sZ7h74zHDdxElhp8M4hoREb41r58/OvP06dPbzO5urmHRMdFzJ6x+\
yPuTmZ/h3P13DJeef2Nws1VnuP/mC4PT0haGV+yCDKv4jRieP33L8PTtD4aTF58y\
hHkaePFyc71lYWJiEnv15h2vrrEGwyd2UYYrDz8xaKhJMFz9ycQQa8zPsJy9lIFT\
RIZB4u0XhlNXXzC8eP+DgY+Rl+H9hxdcbGysIsx37947x8PJweDtZuV0mUWK4aeY\
EIOogjCDr8B7hotMAgxyKvIMr4De/MLCwvAMmKk+M3Ew5BkzMpw/tGPC2nXru+CB\
qKSk5NDb3b2dRcuK4/H3nwxMQoIM2gKcDOxAFbeAqeLd978Mcr++MLDeOfO3rLw8\
8Oq1a5vRYwEWhdwWZmYhTk6OPipq6opMwAR6987tR/sP7N927PiJVb9///6ErB4A\
5QFktlkCLt4AAAAASUVORK5CYII=",
        "W3M":
                "iVBORw0KGgoAAAANSUhEUgAAABYAAAAQCAYAAAFl6r+wAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABVZJREFUeNpiZAACc4vsND5ezlkMjo6O\
SauPP/9vENb1HyCAGP7//8+QXbXkFkgFs76+wX83W3VhOXl5W4AAAgkwbN99YdG6\
rfv+7z9+8X9I1ar/DDDAwszCqxU2+X/dwpP/D528+Z+FhYUBIIDAZoFwevnCB5aW\
Ob4gNoOuri7DxTuv/u/cueN/84Kj/1U1/EIZV65ccU9RQUFx9ZF7DBz/fjD42qp/\
YGBjY2OI6zn8P7Rt9/9ff/7/9/Pz5QcIIEaQZe/fv2cQEBBg3n3oyo/PbAIs0gJs\
DNzcHAzbjt5ieHHj9t1oXxMVExM1BqZVq1Y9d3d3V95+4Mwf5r9vWNTkRBn+/3jP\
sG3bLoY/r64zmGgwKzMzf/l/6dKl/4xCQkJMmzdv/jVj5vKTJs5eVtz/PzLoqMky\
HLjyioGD4QfD04/MDA5a3O/OnDl7npEBAfhZmZgcYkoXbWDi52fQk+Vl+PXu5RdR\
/m8TkpKSu/79+/cZIACHZO+SQABA8eedZKdQUJlSfqQFFiSUEBW1NIiTQ0MYQh9D\
S639A9JWBC2NSYPaUEMNCi5loIEWSKgnWOfHEZ6YaV2fiullvvn3Ho/HI00mEziO\
g8PhAP/aRw0bLb4Zs/1Ar5udEguas3giAJbNgKZpiAuFQjuWZYvbtq3l/SbRAVWP\
BDGmuHR1mxJi94yuUnnP/TPtGpFIWMOUKVav6UW9/AiZVIbLBwHVahW+6yQirs02\
JwoGg8VKuVQLMCL1ulmPGjUAkk9jbTeE8x0zKm8fyBeKIAjiRtwy9H//1AXrpByZ\
UhPc5xOE5xRUcgrv37/wh9PwnhyOOJ1HUcLj8Ry73W6rVCrBXTKPacUXxkfUGBs3\
4KX8Cnm3BCRJgOf5uogkSTQaDdg3dkIMoZmjqE7otUpYJhSwLYzC5fZerK5YF/8v\
RLYv01I8GgjPG4aMXUqddmxQBi6dQzYVC/n9p3t0gs62dsafAG1UXUhTARg97ufu\
zzu3OZ02W0vnFray0IGKTkP7wZ7cm/YSlFDEnuxBGEH0oELQQ9BTRKOQQRFhEOjA\
qF5y85pamrp5RTfvptu0Tec291fXwvCh8/6d7/vO+c53MDPq6upAUdQRf8D1eNY7\
X71zPyA1mnMi1qQfS6tQSCXQVmkQ29tHPBiA9ws1EmZCd4Yd9xipVIyenh44HA78\
k/kAbrcbJpOJz+rfOjPne3PBbJTG4vtY9kdQrhCBz8lBJCSQzBFwTq5i3E2Dmvex\
l8yDJLQ+trPuvzq/8DqXze79ncxms/XrdLrKvr6+WW4B+qfp5JOxb5tkdCsEAVv0\
c2sDi8trmPj6HYloGOHtKN5TG5CRfFysLUFv5ykUqop1XG7Scr37irHF3GoOh8M0\
h1W61mq1PrdYLHcbmppsHY0aSbtRjNNqAolkEgXFBuTzWRjUUqhKlZijI5ic9kCe\
DaDBUATrwDBy8QB6r7Vpn9lfuMRicZfdbqc4Tqfz/tTUFDM0NPhwdPTD5Njox93G\
s1pweQS2dzKYn5kBT1EFX74CTCSOltpymM5UgBAI2MPiAgIFsnkeux0/R/B5E5lM\
hmGDThQIhULo9foakiT1wSAzIpefuHG5+9bTtVQhlukAMjEG1WUC1OgrEEly8Eus\
gkFbDll+EzIRBxmeHJ/GP6e9s+O3aXrxJUlKm1lewdGoHkIpEkjO17fffEScNBk3\
Y3EUq5TIZnNIJFKor1aiq1mHqmMyEBwOlhaW6GDA+3hwcOCtx+P1H5L8j/jPPzho\
UKKUH28zX+ooUpRoU/u5QoaJCulV324mtbWiqyxdUavLQkwg6He5XJ50Or1zlOA3\
Qic1LOi2YhkAAAAASUVORK5CYII=",
        "Lynx":
                "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA4RJREFUeNpiYGBg8GCAgRXNcf8BAoiB\
mZkJzGGZGKfz/8XzZwwAAQTmLS60/++gxDJnca75f7AAPztDREes0f9Ti6r+AwQQ\
3IAkT30QZQMyQXdNY9h/eQHGJ0LcrBtBApdfvP3EIC/ILn1mwyQhsB0ibD8ZGHhE\
GZ7eOM0AEEBg/bVh+v+lRfjKkM3j5mDz52Nn/MgIE1xU6nlLXVFS9ejRYwxmZmYM\
P75/Y0jq3nyfCaZAiOOv6pLlaxj+yDkwPGTVZODR8WGYXhamCDdBSUpQpyvd5fLt\
69cZVNTVGER5WBh+C2syAAQQSM4RREgI8YAVepsqMCABSyZmRobEcGe9a0BHGiDL\
BFmrvAFSgkx//zPEnTt3mT3AQuH8ns6wH+ri7G3z8h3/K3B8EAYq+AZ25Lt/XAaa\
kuwMJ06cZHe31Kp89+o5g6SSDkjqLjOIzI4LmP/0xRtdOQEGhlPPmBg+vX/FoKOm\
wHD3xcd3YAXCDO9MxTh/2yjIyTGcu/+ZwdpIk+H/j/cM5k5+CmArNp97Ufn163cG\
TnZWBhnGpwxcwpIMWhpqDH/e3meEB5SNgQrDJ0ZBBn5ORgZVYSaGH8x8DNVzD2wH\
CDCQFaFAvAuIvwPxJSD+KyrAxfDtx2+4l0FhY6svz3D+zkuYkAzIYiBmZwESq4H4\
iImCwI6+LJdpn/6wMly6//rXhy8/5q/af3Xigxcfr//684/h739GUQFujuxcX+0K\
SxVe9qLZxz/eePmzhpEBFehFOuusCjOXUmfn5GZ49+4Nw5OHDxjExMUZVFTVGPj4\
+BjevXnN0DJnM8P+u7+O/v/PkMyMrDveRT3RROxXOAsXHwMLKxvDndu3GNjYORgM\
TK0YLl88z3Dq5EkGXj4BhhBvF4Y37z8IPnz1eTuKAYYqUuli3P/1lh+8zPD6xSsG\
cQEOBhE9D4ZJs+cxPPvBxcCj6gD0CgPDh0dXGeIyi9kF+XgUUbzAw8Ei3xRleEZa\
mEvky5dvDHYOjgy79h5ikNa2ZmD69JDh3LF9DKYWVkBX8DN8+fqN4clHhrtMyAZ8\
+fHnYe/6Sw6/gFH0hl2RYfvRywzcmq4MDy8dZnjHJM7glVjOICwkxPD3718GCT1X\
hjsvv3xhRgtEhm+//r8XEeLns1DgUPzPxPqdmYP3m7Cs+jdBYeFvX1hEv31jFfr2\
8dWzz+kNM7ZvOXqtAgBYESruCNekTwAAAABJRU5ErkJggg==",
        "WebPositive":
                "iVBORw0KGgoAAAANSUhEUgAAACMAAAAQCAYAAAHrMPbMAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAe5JREFUeNpibGpqOsPAwDALisGACYhN\
gHgmEP+HCQIEECNQJYwtCMTvQareQVW8B9EAAQRToQTEd4F4D1SlCVQXSCEjE5QD\
UiAExC4MWABAAIFMAquG6UKiGZBdCQN7GHAAkKJ7QBwKxK4w09EVsQCxMpIVZ5Ac\
DQcAAQRyUxo0UBiRPAHybTo09NDlcToJFtTlUBpmyEwoH0RXYNH7H93ZDEgaQUHZ\
CTV8JtRQBqgYCBgDcQeS/t3oBs1CMsgVSewuEh8EziLx/yPLAQQQLN5ckaIEljyE\
0MKMEV/4MEADExkIIrGVkLxFMN5hht3Dog5vIDOh2ZKGFHMuuNIuvuiGxUInNExC\
oUngHiFDWJDYoUjsTqQoTccWtch8WP68ixSIjNCAfYcrbyDnXeTY6USLhfcMJACA\
AKVUgQnDIBAM2SArpCN0FlfICmaEOkJcISPEFVyhqzQUFM7jNLZ5eFB88P7v7r9I\
NqB4FXRuJIEHzWmGTqIybG8wy5beZwDyrmhzuZAUR1U9WbceRG8EuCCWSK7P9721\
GEkcR8uJTnQ6wdnRR1ZMxQ03YwQK0IRIT0gZAZAhUD69Mx0fkaj+IsdKZwb86EXN\
MwGZGloJyWqcA1i0SASD03mBO3b6IFKN+9XCVzTVeFc68B1L+a84AfvRgWpNxTaA\
AAAAAElFTkSuQmCC",
        "UCBrowser":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACyUlEQVQ4y1WTTYjV\
ZRTGf+e87//OdUaZ5t5Bg2gctZLBxWA1hbUJA4NRB0mMisqNREwTfZGLWgTVRBG0\
yb5cRkkxDYrUIhdCtapwEREkksWYNlDOWHPn3v/H+76nxV+Ent1ZPPweznOO2NCY\
K95uzaE2JWoO78ApOEFEADAziAYxQYxYkkiUk33PLR2Q/Mgdx83HfaICmQMNoIY2\
MvANAEiQQm2mShAMiwkJ7oS3XrmXhoBGdHg7buIJZGgT/HOeeOYtrLsIiZpeJagM\
QoJoWBH3Su+VbUZm+B0H8XfPQKQmqwOE6tg9WLmKBYMqQqBOEBIUCSUP0DPCxx/R\
e/Bm7MdTIAqWAEPX34t1Alzp4EYnoVPAagm9AHlAyWM9tEr0lgHi7z9zTSKkS3/B\
Sol0+/CTs+h1Y1gnh26AIqKUdRTKhHUr/K5DNd0MW1okfjuPMEj28AeQEtn0PO72\
R2pokVDC1eWs9mg8+SmsGwZV7Oz3FC/sRoc3IkM7sdQAVYiB7P6XodOFkPB1TRE/\
dRi96U6oVihfnyEtnMWN34UVEb/7IaovPyO9OUN26CVk/QjoAJBQDChy/OQMpJJy\
9nHkhs3o2A7YsJXGU2+QvzZNdt9+mkdOYRcvED5/DyjAQAGkv13XtvQH8afT2PKf\
ZI8+izQz8uldrDn6NfmLDxC/+4q0cI60cA6yfgA8BunKMljElv9G2mtpPPMu3f1j\
NGePIaOnscXf8Ntvo3xnGlnbhL761OsEAtLMCPPvI1vGoXKggh/fDIODUHSQgUEs\
FMiGAeh3tfmqFNNI5qg+eZX4zRf0Pf8h+dN7cHsOE+eOIu0RWNfC7zyI3riN/0uj\
dB/bdFz6bR8GdmkF1lyPG91I/OUHtNWCkQnIK6zKkfgvlp8HERCwrpyQCxO3uvaW\
y3NkNoUlJxEwMF9/oQQDuZYXcwoikUpOXv61feA/Pe9Plrweus0AAAAASUVORK5C\
YII=",
        "Qupzilla":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA9tJREFUeNpiCImJST3+8ctbprNaxh0b\
n/0SAgggxjOfv75l+M/AwDL5+jshVU4mBoAAACIA3f8AwvT37dbv9f//+/r/2ePl\
/wJ3ztcACAcHALvk7gDNAAYAAgBEALv/Aczz9u//AgH+Av//APf6+wACDAD/ENvv\
+xIk/fwS6/j5EgTY6/QAsgIMANrh8QDz5t4AAorU1ABmDwYAO+HMAL79/QACAIQA\
e/8Bx/P27e3y9BL8/gAAPBMOABMJBwDd8vUA0vP1AAkCAgAE7v7+ACgPDwCA3O4A\
xPb6AOX8+gB5C/IAwOv8ACQPBQAD1jQ9dxkhHwknBQUA+AIFAA4JBQDwBAkAHQr9\
AKzNzgABNsHO5f/+/xr5/fwARRAKACgYGACr4eUA7vn8AP0EBAACMETGKg1DARQ9\
772kealKaxtbBytIqbgJLuLg5uIXCE4u/oGL/oKLs4h/UQQF54LOFQpSrRhFbbXR\
2sQkjW+8cA+XwxWtt/6r5bq2EPBn5nJKYQCElOL46PBENP13owhOClsLHp9RzO1g\
aMopkzgZyG9Dbc+XIaeJjZaeJGy4iocgNDnBWpvJs9ft44wkV0HGrjvm/ifkJRJ4\
WiDbvWcaYUyoJY+JpDmE619FzbE4OD1HnnW61L0C63lNQ1tE1RKbZU2tOEVxeQXr\
SdlMhwH12QpfaYbdvmGuUmX/zscuFBGrl63MUpKSEuwsLdIZjbno+Tjm0ywKP/4F\
6JiMeZsIgij8dvfufBfbuTgxiZPgKOIHQEMBDQgoSEFHxQ+gAlHQUFDxR2gQooCC\
iB6akBoEQogGcTixHeMzcZzs3e7tHc8Uo1lpd9/OfG9W7P8ZJ9NSdq3WEKRZsGnH\
aBBSp+bj1BRIMoM5p1AKqPmC+5KilXMjrwzCek7jSl6+uFhHBIGYFwMe8MiPHuPK\
nCQRnRmD7zONpKhQExKuyJU3I0ePyjudNn7wtVc/J+gZYGkhwINzPibWYUMWCAg+\
pQmfxxpfTywubS6hQV1x78278bPrV5fTKsDrwxP8rTzYZoRCkFgOtLwKl3GKhIBG\
2qEpSqzWJI5HA+ztf0hVcXPniTZVpNc6qLPsmL1XLNEygv89V/B8h/MmQ9yooxsF\
DB/f+gf4dDTSXrx9Abv9Ph5trOPWVheHucMxG5+VAlYorOoJ2mkflc1xpizCtXXs\
JT28Hx4h3tqGuPbl13h28Hu55AQuRCHurjRxo7WIdmuFrgSgBsx0it5wiI8qxNve\
gE6BLhCxyVLRvn3n6eb9h4+V74v552VGyZG2riT4ggIKSiqITDNLlIQuw0gUWSYH\
L5+/+AccrKoSni9nxgAAAABJRU5ErkJggg==",
        "SeaMonkey":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABBxJREFUeNpi/v//P8PZszpPmL9+iz8u\
HW+tBRBAjH39J3UkZbivML19a3BZVlftP0AAACIA3f8BwsLrG4aGvuQmMBwAKCoU\
AAHs7P4Amsn+/9qu8wD18v8AAgBEALv/AMDC4ABYWLLJX2Cymf///wAATEyr/0JC\
p/+Wyv7/JiWZ/QGAgfz/LioDAOEZ+wDlsAQAApuX4v/zAfYAtX/xABMT3JQCAIQA\
e/8B////AHV1wJjh4fFn+vr9APX0+gBphEgAuKzWAIx+MwoBY2a7r/j1/lDw8PIA\
4+PxAGWSWwDi+QcAWS8AAGFGoQAEGRcSwaqpG1D59v8AaqYXAAkJ/ABZKP0AeF3w\
ABgXTAAB7vT7R+X8BEljQ9plEhUWCgwMAQABAf4AGBnfmJKRMmkCAAgB9/4B/f3/\
ALKy2gDCw+WL3NzuVwUGBO07ORVsVFUpxR4dEQAC/f3+AJyc0f/h4PB0AP8AHREU\
CzArUTfEeXbBtwAAAAADz88t8P//AQj39/wA8O32AGyTUgDm7v8AsprHJO35/rUC\
BwcKDwsLCAD6+fwACgsFAMHdAAD+/f4ALDIYANXK6pwELS5KAPT0+gBERQYAAi0A\
AOX4/wAgEgAAEAtEAPwH6RUEnJvlAAkKBAAoLAUARjAQADgd/QDZx/sA3t73ACIw\
8rEBiovdb8HEEZBNawsA69H5AMW7+QAHCQEA/Pz9AK2tFQEEPlYhNv8A1YGmhBh/\
EREFAA0PBgD9/fD/cHEACwcHAQACdEg+IVGEYRh/vu+b2Zl1VnbUtdk2HPLPVmze\
CusS3SJKiLJThw57qaCoCKxD0clb2qlDt8I6eaqNVjpkheEGrWAQomilRU2apjM5\
O+PsfNM3+8J7enngeX/P08ginom3Syi/XLwzP7dxizHSxBhFfOKcw93aBqEUWrMS\
6Wn54eBg3418T5sb64hl+Rgbm71eKs2NaOLLmFsMN94gCKEkGIp3j8PobMb89xDj\
I+OYrvzAyX7zwcDZ7GXGtBPXys9n7xNK4LoBYp6eF8IX2FzHQ//FI6AdOzCzFEFX\
Oc6czuNTZRnvXi/3rfhJg9wbXpwyza7DwqGw6wukNhzbg71Rh26qWO/ZCUeY1eQQ\
+zMc3W0ElRcrUJgO6/faT2m66lijj9dAGRfiUNADEjSBUxcySPYmkQqiRsPMdIRC\
B0NptIZnTyVoKR8trf9WSbVq7SoW/352nEwavI6uPRKO3WxF924gq4RgIWB945h8\
5WPmwzbkBKCqknhzk1+5Ghwi7lYgqhFi+NGfjzRrHPg66eFLtYa6SIAyQFGJcEAg\
y/EyIQyQy1nloaHOAV3XatK6x89JlC7cvtR+cOLNAojxq5cWtPP2pnbUtklOsKHJ\
pmg1lfKm9hXqT/J7W94bmXYIcSP+/1u3vJWPrLGfAAAAAElFTkSuQmCC",
        "Midori":
"iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAYAAAFRk36sAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA7JJREFUeNpiVPFkYPj8h4GFxc7d+jCL\
+jsbgABiVPVnY/j151cnY/VRh/+vvrxkAAggBkUXBoZVz/P/81syMMx+mPif0TpR\
pkPC53v5i09vGTjOKHUABAA0AMv/ASBNAAD//wEAGhYWdwIRDhRudXll9vLz+ecB\
fshC/+/17wDv9O0AAhcAJQAZ+ysA3+3iAAIAdACL/wEkSQAA/AQAAP75ACBncVbV\
AwMDAJCHpwsDBAAhARI6ABKfr3vt2ujOAATsG+z3/vQM7gjeCPr9+wADa45E5Pn1\
/wnf9NoA/QD8Ctv3zgTf6twAFQAhAAEHDgAABCYACm6UOvX99wQA8P3rAB0FJQCC\
e7IBAgDoABf/ASRJAAD2AAAAEhEMAO3u9AAKBwQzCQgHbfL19ZQCAAAAAPz9AAAi\
ICGakp9v/wkLDCvs7vVgIx8hfwT39QAAhYtw/wEW6wBnW5Y+AQX7w3dzYPDv9u32\
A22CVOMIIPQOBAIDAAsAEChcbTyc1O7JCPPj/twEGDcBHPz4AQDZ7N0ABSnxOcvd\
5ADy9/AA9d79ygLr9ugA9+0AAO316wAtCz8A6vLoAOz27ADd4uakAgsBEADx+uwA\
9PnzANry0AD2+vQALBkwAPTs9sQCkHezAeHO88T3//sAHgIqABYTGwDBnOpz7v8A\
AAKUSC4vbURRGP/unTHRySSSSKYV6yMIjU9KrRVtUbBLBREsiApuXEiXgn9Bd24E\
RRRcZNFFFt20glJKC0LFxyIJrVbqK5rGByGGNEOcpJncmfES14fD+b7f+ZV6lupw\
vjoDHDYbpwL814pNdb6aie5X7W+VqsdN2z9Cm7+Pj+eYrn/lkSAS8rCoFwDJKY+O\
jw4u+LuUR6LMEFq/ug4sbwwJHjMiFAGjSF9MTY+cV9d468TUHiDXS8PvV6c/uZ9Q\
JDIxlNkFfF4JfVnb2B1we2hbZ0dHcHCkZyxF//L5BU4v1Ch5/k6ZmZ2ZnI9rf5Ar\
3HGPKAyTwSE5IIgU6WwaalaFYVjQjQKkigok98Rv4pu+Z7NRLQKJeaHkG5AsP0JG\
y3C2WZSLUgllgS9wl6HpWfgEPy6jt+tiLp/PyRDA0nZo9kvEUmewiIlG+hIEJvbv\
QmCsyFNYcDllkBtP/Or6ICD8/B4PQLAkYtJK4mDemHYINaeiVnoK3cojqp6UBHK7\
ZDSTPu1jcLPLsllJYq8ElF6Acon44dru/s5Ff2t9T+LmNrGztf+hpdn32uV2Vv8K\
HwXDa8kl89/DF+4B0jyKcaKoj14AAAAASUVORK5CYII=",
        "Konqueror":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+tJREFUeNpiTktLY3jNb8LAxMLCossV\
VvAfIICYk5KSmD4Km/1nOs6g8zc0NPk/QAAxpqenM3gHRvx/IajGwPby7i0WBiC4\
een074/Cn1l1uL7yAAQQY01NzaS3r1/l7bzLyAAGiYmJDE/fffm/4ND1/wrOaQws\
slISBxo3XmDgZmdh4Gb6zcCkoa37V/bViWfyn2/8rIhzegcQQGBbhISEWjw83KtP\
Xbx14/gLhsdvnz9be+/+k5msLMwMjD09PVM01VQyJ5/9zmRgacbwn0eCIUDmF8O7\
Vz8Z0ksqGcEm/P79m0FY3/4/K4cuw5x9GxnefvjEEGtuwMD56pgiE8hlTExMDB+v\
HmV8dnwS496aEIZ46Y+sbC+OMjIwMjECBBBjbm6uxZ8/fz78/fv3xqWXjAyvvjKg\
AJbv37+f8PPz+//927dPN/bdXyryn0Xs9d3bSUxMjJ/+g0xnZmZmuHbt6pLA4FC+\
iXVZmWaursFntkz5yMDwXwRsfUhIyItXPzliQqfvYdj17B/DJy5xhj8//zGYGJuv\
BylgFhYWZvvLI+Rso2bMMOn8fYYP338wnD1yhuHL+y/3fn16vpAJ6IY2RfYfa5ac\
v80Qwvmf4dKm5Qzbrj5gcJD5YGwqDbTi58+fDA4ubiHW3w7uYWd8wtAS6chQrflt\
r6u7B+////+kwQEF9CYDMM4ZNDU1+799++by8OFDXZBGQUFBZ4AAAyv49++fkLq6\
+lFbW1uNM2fOLLly5XIlGwvzvyN3vj9/8un/fw5WRoZ//xmBhgDjhpERJZzABoAA\
0BBBMVHR48qqauoSMooM3BLyDE8+/2YQ4OFkWH/mAYO/niQDx8/P10u7FoS9+fD5\
ChsrOHExMIGcB8TsPNxcOvxiUuJs0gYM7DIaDJ+YORkMNRUY3jDzMnCKyzA8+8nA\
cOLVT83s3JTLlobaNT9//oLElIWFxQVVVVX9F08eMWw5/5hh2bX9DFLKCgzfeIQZ\
+MQVGX6wiDBIsHIx+GnwMtzk5me48uA9AzuvVBQD05XOv/8ZfjOCcgbQ+QwszExc\
WvrG5+beZlR3VtdnUJPgZ3j88xvDymv3gQn0PcPvNy8YmN++ZAiwcGWQ+n/v+f8P\
t2x//vpzlwUUKCDMxc1jraGiqNal8Ith/7UrDMeuiTOc/fiF4c3rVwwCbOwMoipq\
DCZmagzukt8YPn1gl7z+hS3l38/flSyw0OTg4OC6fPnykXv37rUBo2gHJxOjYJmF\
2W5lT23jq1eu/r5554j7x+df9x++w65obGzcaWBgkHnlypU/8FhAByBvCQgI+JiY\
mCy9cOFC3+vXrxtBCRcG/v//D6YBnKOYKXjrnGgAAAAASUVORK5CYII=",
        "Epiphany":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABBtJREFUeNpibGxsZHj1+e8Fpk0HL541\
t7DQBwggBjNzc0UGEPj27ev/JUsX/AcIIMaOjhb5t1/+PuBVdGOwU/7KwAiSDQ4J\
/P/gnzqDq9pPBoAAAEQAu/8DkZGPABofJKzj7/wc7ufgxwG0tK3/5gg+AB8B1ADL\
ycEAAtvi8ADPvqQAFxEJAN3l9QABuLm7/5CjuQDx9gAA18aymwKIsbGxhkFYRGIu\
G7dA0sOX3xmYOQUZBLgYGYQ5fzIY6mhzMGloah+9+uBdEi8PL8P3z28ZJEWFGDws\
lRlY2TkZVm/c8IMpK7dsp5I4D4O7ow3Dq/efGJbtOssQUbOK4cn9qwzbjz6FuBsI\
zBKSk05+YRBnEODjY3j8+BnD5dO7tjx7eNMPIAAACAH3/gOBgYEABgYFAFhcYnpL\
TEmR5PcPS+zi3Mhvb2nwyMjJAAGCgX4AAgsY//L6AwD7/P8ABwsRACcbBgDo4de3\
U1FVSgQuLy/z//76ALrR9QA9Sl0ADPHJAAwIAQAD/BhJjY+KNgLI0dwMq77bAFhB\
IgDc1M4AHhYLAAcEAgDq7/UA9vj+ngL7/wUAj3xlAPL1+QDv7eUABQL9APv69wD7\
+PUAx9HoCwTt6OIA+fn6AAD+/ADT3OIAVX/SAF8+EgDr6+0A7ufcswPe3uAODQ0J\
OcjIxQDc7QMACAD4ABAG+QDZ2+cA08u9OAP59/TH4OLkIwYTJysnHBMADQcCANDR\
1wDCuKglAAAA7gLUTD6hTcNRHP9m+TXN1iS1MWmrk/mXDmQyYYoiggdh05129eTB\
kyJIwUsvHgcyvKjowUv04NGToBdFpE50/mk31lWjG+3SZWmbtbXpn9g2MRn44PEu\
j/fn+z6P8nXwjWEIqmYtKUj7U/SIJJ8cH8WBKIfFlRLer9ZhtTuIBev1TPrVwtlT\
J+49uP/QpqghUIryBBRF3Zbk6IKmVyCHWaRXd2DyMxACFkIwkYg53vbDcJ0BCNXD\
74115HL5x1a7fYPQdCAl7Q3PN5sN5NcNfO66EFiCBPmI2Pg0DK2DeKSHLaOGjGrA\
/mtj8hCLeFy+buhlQk9fmlW+qab49msRUxOHcSd5DeFQAMv5AhzXxeTYEA7GeYQ5\
FhNHZIyKBCuqhlarjQ9LqkhS84/WkrduHlXuXsHAhSe5jZJeRr5QRcTWkF1rYUwK\
eio5OH1MQLligKM7yJaaKJTMGt1tVrPvPuWuuk6fEXkWytNniIoCNN1Apmih6qH/\
s1jBD289MmjA6TawubWDpWXN3cyn53ZxZQJk6tz5C8/JMJe4fPEMNrY70OoEIyy7\
29l1HPQ9EPcw3k/1TLx+82WxqH6fAVzrP+9+9OcMB9nQLMvLcxFp3/EQJ/Deqah2\
y2r9qW3/qpv6y75tvfDyTM9tv/o/3SS6rabSal0AAAAASUVORK5CYII=",
        "Leechcraft":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA1lJREFUeNpiePv27cQvX768Zbh2/frb\
XD25/wABxAjmAQGjjZ7B/+cfPzMABBDj06dP3zo6OAv9Z2Bi+Pr7LwPLkydPGPi5\
hBj4eAQY3rx/xQAQQIxfv359+///f5A2hr9/gSoUFNWEhAX4GL78YWDwdrFlYMqW\
YmRgYWJhEGX8xcDOwcnAMus5E4OqkiTDnz+/GQT4BRkAAojx9evXbxXkFIUEBASA\
ljMyQMB/hn9//zE4ONozsHz+/JmhwpiPYftHQYbvjOwMTsI/GHp0fzIwMP9nSPwm\
wsDy6dNHhkM3vzHEif5jYAIasPqZIMPMl18Y/v//yyDoy8vAuGfPnq8njp/k4mDn\
ZGBlZmVgYmZh+P3nF8Pv378Y1DXVGAACcEHuOA0EQRSs1s6wX+dEZCYj4CAQIySO\
QIiAo0Bi8DkQEqkzkEiQIWBJkAUeMB6sHXuWXoe0Omy9rnoyddMPayz/R5THe38n\
Z6fn7fB6iHT5yBqwW62R8cvTpymLHMkrKivKIMyCdA5k1VJVtZl5a3jbj+zc9Agk\
1HuOtmm5vF8pyxKTZimLOmq4sGgaZg8Tdp83mbwHRusDI1w8fnOceEam5KrOOUkd\
t1lQk4DJFG6QbFEWPfK0YBxX+N8fanlVBk3Y7vc5PDrAmg2stcQY9XdQxTnuy6V/\
AhRO7ioNBFEY/md29pI1FxtBULC0SmUQiUXEd/At7PMGvkQKQcUmDxArU1nGQrA3\
TZCFbLKb2+xlZj2zi62eYmAOnMM5//8dFgTBZjKZ+OPXMWzHKTf5K0wDmSTodM7Q\
u+ptBSWkUfrx4QnNVhP/hYFnuVhiEYboXnalSGlzkD2nLYbzY42XmUBO/HHGoQqG\
I1/h4kCBUWEJHgfep1Riu1BGZykllOWg1wL61OBt7mLNPJB42OQF2k6I/n6Em886\
YmWBqQzTYIcTi1ciJbSP7brg6wK12QrDWohM0w3wAvfZHqaRQP17h+dGCmUGoPxg\
K/Hl+ZWRpkGd5bibWxjoQziktCC4BJHn+xYEFbXXGkpnyMm3lCiMZIDbmlf+hRnD\
QLaLIjRsD9xxIWg/19awHM9wB4/wTdMEOpNgiYRcRkQrLx1ho9FoSP5elyeFClhW\
PWC/CRSl+kV1bSXqcRwb3D9+AJ9Hc/IMFtQqAAAAAElFTkSuQmCC",
        "Sputnik":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA85JREFUeNpinrTvOsMdXu/JDDo5G5r/\
AwFAADEm9+1g4GTnYGDiFJT9v/z8n/8AAcTYvOocQ/+ud/8zXKQZlh19ycDka6HA\
wMvJwsDBysjw9/dPBoAAYuzfcZVhy5FH0WJ8TKetdRRuMUpk7P+vJc3BcOXxNwYZ\
AcajDOLp+/7DgELewf9MMvxML0MnnGVQyD3IEGTKZwEQQIzTD9xmeP76s9q8/Z9v\
sjD/Z4ABoIavNf4yPAyTNl8MfP3p+/8LD978RwYgu2SyD/5nOXHj5YlHH1gYgs0l\
GP7++8fAzMTEMHPPfbAz//z9x8DYu+UOAysLA8PTt1/Wvf/GFLjj4huG/39+MVgp\
sVvZGUkcBwggxsn7gaFx5y3Du/dfpc8++VMsxM18S1H4/wxdFXmgKUwMLJxA7buv\
/b739Q+7IiMDO8O3LwwMDz8xThcQ+OalKcu3nWnNgWf977//V/zz5x9DiLkog7oE\
MCSZ/jOsP/9l24NXb5kYlx17/N9JS5hBnJ8T7sWoyecZjt/+xKAs+L+RKXf+bQa1\
wmMMyMDLQARMP/7wQ5mJi/X/j/uTrBm6Nt2CKyhZehtM26nzzWZaVagjp1JwjKFz\
02OGd19+Mgin7GHgBIbB75/f/mspCR9iOnbz82tfXWaFp9Pt/6kUHmXgZvnLwMv6\
72SxrwwTK9NfBoAAdVNNSFRRGD333es8Z+Y5PufhqLNoMKfUGplcxIQRlELi2pUt\
dKG1bSMGboJWbgoMN0ktWoi5EWI0CgQxMioYi1BHxSl/sAaLwajmzfTuvOf3TNr1\
wQeXj+9cDuecj41SKhgDmOVgLfPd+LDz5072l9JrOVxz527ZjgNOwhqqfNYS5rfi\
p2rXyrhyNGfjcxnkC1blw/ls6sBkDa6hrqWWdGCRFbQDj1Co2fFnAEHNnjb9fEhX\
V8Tix63qF+nSJ81XpiWiGq6cDeLiaR3xSCUxU45BNkaebuL+8z14Pe5M8U68+rHc\
GRMX+PTjsaHWk4GrsgS8TB9A9wkMtEcIzP6p5r4vNRmorhBILn2DShZD4fiaMz1i\
8FFq9e0XBcWiRCjA0R4L4n+1kM5BiL+s3OTV6GKXvdvIwqd6xnVNvX43+RlTb/Zh\
Wjaawl7c7q5HZ7wO92YyZNMWHZw4ElwSXcOPpa6YPyEWM78pw/kb2/s/H8y+z83k\
rVJtT1sNRvvOYPjJOq6NrSJQzslbm86wAAYmu1r13kRzcJLiB+GQrJI6XOVNXW5k\
df0dzTALaDl3c7ZDCl+0qlxyXS3snjDEAknw2u9XnQgFtmhJ2IQ7BBP7jtWwZjkk\
AAAAAElFTkSuQmCC",
        "Links":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAAHnlligAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAfhJREFUeNpisGNjYzVmZX7410KG8RdA\
ADFEsbCwVbAxPbX5U/ypGCCAmGsYGBgdGB7KMzA8YGBkYKiZt6DlwQMGBQUGgABi\
rGBje/Tv35oSJgYg+M/A8Oc/mPrPwMLIUPmHob0yu5IRpIWhAiiz7wDD////AQKI\
AWiaPVglBDHAEBMHA8MBBgZnR5BZLC4McMBUw1DDCFIDAvZ/zCsqK9ZtBPJBIi1A\
oxmQQGZmJtAOgAACuevj//9AdI2B4RrEdQwMbKfYQHqAzoDazAC1ma2eDaQE6Ecg\
aGpkgNkFtpwBK+AA+bCKgeHhH4alQG5VdhXEPcfPHQfqaGVgSIGoa53a+o2t/drT\
a/bu9iCj7B1A3nNwYKhvZOztZxAQEGCAuYMf2XygJ9rb2wECjLGJgaGWgWEl0JMK\
DPIKCOkPHxguWjIwTENxE2sbK9MvGIdfAGgXw979IJRfwACzBwUw/mKEei+cgaH/\
AsPBA1CJC0D2f3TjIYDlKANDB5h1D03mHlpUgMCv478gkQSJ5P1AJ0HCvq6BwdnZ\
GujLHz9+9Pf3+/v779ixA8hta2tjYWD4gTXM//z509DQMHFi490HDH6BDE72Fx48\
ePDz50+gVA0kBN9+QKQrNBSfwDB//nygDfX19cAECYxqFwwLtjs5/XNy8kYTPXjw\
IAAzTs19864b3AAAAABJRU5ErkJggg==",
        "ELinks":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAAHnlligAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAhNJREFUeNpisGNjY7NnY2BgsD53gQEg\
gBgqgLwKNia2ql+h10MBAoi5hoHBoYHh4HcGe1WgAoaaeQsY7B0YgOoAAogRqA4o\
0FcEEmZ4wcDw5z8DUJLhP4hbCeQAUVVWFZCTCWTVNTD8//8fIIAYgKbxg1XCEQj8\
Z2DiYGD4wMDQ1AjisiiBRfeDCKYahhpGiJkMDOVhGc6ODPkbgfz/TAwMHAICjAxg\
TeycM4COunABpAgggKDuAoITDAzHIK5jYGA7xQYy5e0HVMv/M7DVswGNYpgkALaZ\
kYHFAaz+ANhyBiTgL8gAtJwBKM0B4gI9ZgM0Yd8BkDlAyyuzKh0sHIA6WhkYnIHy\
Tg4MIoIMHz4wfPj/wd7dHmSUgADIe/kFDPoGDGfPMxw7dgzkXAaG93UNgsg2Odrv\
P3HiBECAMTSBw7ICHGI4QSZY0X8G1lZWpl8wwfwGUARBvAgM+L4JUGcCkcBycEAD\
7f3FCIoNsGaGegaQOkSE1IMMBroSGJ8KCgwM96EBxXKUgaEDrOAIMK3AbNsHDiug\
an5+UAg9sGRgmAES+XUc5KAWuB3INkhKivkHQEOuv7//x48fwNTR1tYGDKYfmJ4E\
usHNzbYgf7+zg319A0NuQSEHBygSfv78CUqSwKQCNAY5XtEQ0Bvx8fFAG+rr6xnB\
UejCwPCFgeEUkh23FRX/KyqqQTiKYABkHDx4EABjPtKZfcfvRgAAAABJRU5ErkJg\
gg==",
        "KMeleon":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+RJREFUeNpiYACCLBnZr0wmUuJvv6Yw\
cQIEEAMnG5PeQjUtBsaU7Zr/Px7/zgAQQIxsHAymC7RMTzEyMDLs6frCwMT0h+G0\
lJsXw1HnRww/F35kAAgARAC7/wOhJioACQUC4fgB/yvx+/yzAakzNv/9//8A2xzw\
ALvB7gAE0iz9AOZO9wD/tPMAPjgkAAIQ+CUAtF/dACMtBQCdxdHBAogR5BI+TubN\
k2XVfRiQwONvPxkant3lYVQS4Lk4ydxe7+f3fwzvRd8wXPN4x/Dy1V8Gdk0uBslJ\
rAws/oam69Z8eq4n4PSUgZ2LjeHS4T8MLKyMDDb8/xh+MGkzgK3g52AWtdPRf9WV\
ks7w6sMnht1nzzHM2bXp+tsv37UAAoiBmYmRAeQXXX6e2WnS0l/CJcQfcrIxmwhw\
soDdwsjExMheL6vwQ4GdE9mNDPn3b+7++vuvG7OTuNgPF3EpJmY2NgYQ/vWfheFc\
yQ8GeT0B5VsnPh5hSdHSZ+FlYmd49/srw3/rlwzbeb8x8AkCTWP9x6DGIzCTRUJU\
mmFJ+CGGf6wcDJ9v/mK42P+SIWiqIsP3B18Y+Lm5BZl/sDE2/Hj6ikGNm4Hh47Pf\
DH9YmBikxJkZXl74w3Dm4rvdTJuvXljXZdHA8GyjGsPF3a8Y3F04Gdi//GDgeqrK\
8Pvnz0AGdlZmBm42ph3LSkr+35+34P/8/OL/PkbG/3k5mAxBvgEI0CXZg0YRRVH4\
zLw3Mzs7u477w5qYGHaXlSDRIJaK2AiiCBZqYaOgYGlsrGzsLLW00TKCYimmEzuR\
oCBEMeuaLCo7gWQyszv7M7P73svNFBbe213uebx7vpMaxckLx2KWAh5fK1SWzjiu\
zjXt38mKOiHEq/0eXvrecxrdGyRyIKSCZlv7C9qTR7ON+4cNE/+XIiEtpCVMhu1T\
Cm+bHXz9FLxQmrzDuc6ePpxfXJrPuUikSNnt5w+SBCQM9BFaJ7cQXbRBeQCj2ezf\
AhbC0u3XG23OG27hxolqHWE8xB9rG0E1Aq+PUStJeITzy8dhrGJhuG98vXqpiLbD\
YGcmKB4p4lhQvsyVzqLQMCuTnIH3gx/wWyFmsg6aGp2jS8idsdVZG2ByzkV/LUYt\
K9FuRhCjGmK+NaQfiWVlmrcWGnM5W2nwvS4CbwdVgt3Ia7CzGkpHM5iZYqgwAZ2P\
YXfmsP5riA8b63dTqxmxzWeMdw+uXF28fvosoTOw2vyJZysr+N5p4eAhIH+AQ08c\
5EUZ3363d71ueJ7gfU4fsCgdDjksleT9RFywTX6zPjV9fLpYKjPGsNvrRpuet+n3\
omXO9FfkfC8aCYyFxB5zW2tbvCDSiAAAAABJRU5ErkJggg==",
        "Palemoon":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAFo9M/3AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/VJREFUeNpiUPHpZOhccf0m0++312/r\
q4irAQQQo4Z/jwYDI9MNhtDq7f9XHnr6HyAAACIA3f8AIkiCJDVfo//H1+7/9vn8\
/wQCBQncIhoLAM/lCAC91OwAAogRZIqSuu5+Kw3eg0s3HW9g+fH+8X8jXT+GSGcZ\
By4B8TKmH9++MPz+xcjw+y8Dw8GzLzmZeFh/MAgLCTDsvvaP4dWz200AAQCEAHv/\
ASRMiQAB+/OkAAkZW0hHPwB6VyMADgoFAAUFAwAmTIkEBPXr3cEVFBM+Oj0wAO/x\
+ADb5fUA6fD6AOTs9wBjXlL8AgkKC8Ly7ugA7u7wAAwJBADL4QMA6fYOAO31BgDW\
3OoAAgILGH0EEiUE0MzG9fr6+wDz8/QA4uXpALm6vITLycYBApA4x7wQgwEcxv99\
257Tt9X22rgykUgNEoNFYtHLjSYjkUhsEp8Bia9gtFlMNptzCYlRYpBcGYSQc46c\
Ur322rev4gv8nuf/QRBAqbZbry2sOCPCc+PiavOh/e5nGQMBIEpIOVHsnfqc424s\
TddO9tdbW6veIc85yHfnNiTiECqGibJM8Njto/c1gDfvrhmGPiXFcb/sTjowqypa\
TyG8WRvHl+2/rGqOHhBCBLx0XsE4EKcyGCOYqCo4v+6CpWxcoqUcYh6hkBBlMpp+\
jmQgwdJV3ITBEZG0sb0kCmCZOuyKhl+Rc15IGT56b9uiNbPcDD8DUSjpiwqlSJIU\
/t191Dg7HS76/EeAosmlxYkgisKn09VdnXQlTsxjBGUwgpr4WgoiyIgL1y6djZv5\
B+4NzN4/4A9wEFwLgvjCnQ6IjA6MMIKa7nRPTEicrn5VV3uNC6sWtah7i3u+c2rJ\
4d8qK45lPqiJlfuOaIl+v4frFzu4sCaw2nSW/vyWydGjp+8fPnn2YavQStMDMFvn\
byOX02Ehp6/Sgq1nqNlus4N+r4MrpwU1MqhCwzINHG9w+9bV3vq9O9eG3kSWu/s/\
35juiUtb6Xw85NxB78xZDAbn0DzWoDQwWMxYzrbiWhhNEhyMI3jTlDin2B2bN5XS\
Bivi2d1ckSPkmcuJZVnAKDPSygkEsNapwrHp0igxlwpyluLdlxlGYQSZlBsVzm2f\
mRpxnCAIf0FKCaWpnra/sPDys8LOARBnLuaRiW9BDkaURSUDMwq/YtZPbdYclnJD\
UrAXUEqBmSaEqFI8BCySFkYl9sIc89wGrzaw2m0jzbMkCLxNwsj3WfsyVTa2J6GH\
eHEIRhNbjEGThizPEScpYpngKErw/YeH5y9eb3/6uFMvdfH1v42knb40HcWg6jY2\
Wu3ujW63fbIu3L/yRkF4+Hbs+4+zLNkzCFip9bLtDwKnrAkwTpVpAAAAAElFTkSu\
QmCC",
        "Amigo":
"iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAAGHNqTJAAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA1hJREFUeNpiYAACryMMtxjQAUAAMRg2\
M7SAaEavQwz/f31kYAAIILCokC6Dss5mhu0Gcxn2gPhMIEKnguHOl3MM6rxMDM4g\
PkAAgZHbTobrfJoMCnCB8AcM//3OM/wHsZmZ2BkYvigwuPByMYi9uMpwlNFhJcP/\
+9cY7jICbZRVYFACCCBGmDazcwyvFIQZRP//Y2D495uBYZ0pA+f/jww/4LaDgPBn\
hm8/fzEwrFZkYPz9hYHBczvDd5gc2CSDOoYlQoYM0UwsDF+B2v7/+8nA+vcXA/un\
twxPz2czyDDKhzIUSrsx9D25w3D9USeDFky3/iSGT1xMDLyffzD8AQggsAArHwOX\
80aGA4FXGR6ZTWKYgRxmYKs45BmknXczPODmZGD5/ZWB4c1dhvOHvRmM4A7+8ZDh\
Kfs/hh/vvzJ8YwaKCEszGMJMACvglGDg//uTgefMHIa+5xcYDv/8wMAgncpQC7fH\
diHDUZ9jwKAEKudSZ1Bz28Hw32EzJGhZQAS7CIPV99cMDC6bGT4z/AWG22eg4B8g\
FmAQYFaOY6jlkmRwfPaE4e3rBwzv3z1j+M7OwcDJ8JOBhVWSQZ3RZj7Df2BAMRyK\
Z2Bn+MfwC2ysPIOmRTXDtf9AUwAC1FHtIAlFYfi7airmI7AUAgstRMheDi0RNoQO\
EUEE0RC1hENDQltztTVVi7UHQdBQErWXVL4KbQgqoaGIEI2bz+PtPwWpRQfOcM7h\
//heHKFWs9YKizeIJCWqleiF58SZCMRNfMFTaAnj6TNEfvdLXnsoihBvjxEwD6DX\
YEEHFyYRA4lilgnQt0/Al07jUbxBvHZOVgdZAuufgd/ogIdRCRLXiASn0VcuIMdp\
M7Kx24dtlbMa7x8mZM5c5yzWGTX+NQfpyo+x8gVi1Lx8iwueUpYGGOQaB4aeT7FD\
rlbqQEyDcHct4qBEAIz8uNvHaiWMQ7UJzR8pxHR2DDeo0MqrodHDzPQwZS5x9NMf\
nQ021wrplEEr0I1CSQ+KKkNusMQIvECbZ8q+vYpvYer9HHuCyghDzzJCqiY4OIBI\
A9E1eKV7nPB+1qjNt81j0+rGQpEXpPIFXnxLISEYRhGQa2DntgpKNGaT2C1FsYF/\
ltKJSdMI1hVqmOm3SGceEP4EYfwRVablEgsAAAAASUVORK5CYII=",
        "Brave":
"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+g\
vaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAB3RJTUUH4AIGCSUmsBTTCwAAAspJ\
REFUOMt1kk1sVFUYhp9z7r0zbWdIycxobQsYAwqSYIhCRBNZGQMk3eDPiAlqXWGD\
G8uCBGUBxBjXuqiBBKhxTIk/kWCwaSNEsIuGIgVMi9BS25R2nLaUmbmde8+957io\
M5lKfXfn5H2f8+Y7n2AZzV3vWGkFud0EMzVCe8poHRqj50sP3PMNOzqL1V5RfciN\
XExaN7vWCDVxMFIceENoDzAgJEbYKGtVZxDZ8MXoqyf7twihlwDuTBbiyZ/Sx63C\
xEtot0kUshBLIZNr0dkh8PJQl8DI2nkVbTiRaOttB7DLAPfyl82pu3++IFNrmura\
vsN4eRACnDoIfYxyEUJS+ur9enVvdC/QDiDLgMaBrtdxndW172UIxofwek6h53KI\
mnp0dhJ1IYPOThLZdQRnwXpk6uOXP6gAhj9pbSSb2xF5pkWIFSnsdVuJvJgmHLkG\
RqMuncHZ/jbWk89jPfEsMvk00em/2iqAq5t2z4XUTqjfzqN6v16sZEcR9c0YN4+I\
P4ZMNAHgd58mvDOEKKqeCuDNlpaSErHfw3zBLJw8gv9zJzLVjB4bovDhKxCNAaB+\
6aJ06hgmXyAIrbNLZuDWrLxijDVjSj4iufhaZOe72Ju2E93VumiqiWNEBG0EqW9u\
dy8BDG5NX9FGzmAE6tJZwtE/8LszyMc34P3QQThyg2DwMiy4hFh95VzlG197p3V2\
cu+WYTv016sL3xOO3SJ2sAPZsBo9O03x8B70+G2E4+DL6LlyTlZvYnFFqgcD2A56\
/BbFz/bh956h+FEaPTUGToQQST6eOrfsKmOMPfHW5ptxv/BU1d3iQv0rJazjyoj9\
Td8Oew81QIhgVeba+r9rE58ry8kbRCUcCDntCvvQRS+xrxx+uEGV+tvTOx/N3T0a\
K84+50v7x/tW/NONmf6+//r+FwAwcGBPY9381Lr7XjC47fSv88t5/gEaPi8G9Y/3\
zwAAAABJRU5ErkJggg=="
    },
    tech: {
        "ION":
"iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAAGz7rX1AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQ1JREFUeNpi/P//PwMyYILS/6GYgQUq\
wIiuAg4AAogR2QwWmD4YB7s+gABC1vMf3TwmHBIMWN2DrBgggBjRvYOuC6ddGACX\
xH8WZO24JJDtYkR3MlwXQADhdC4uk/B5BS9gwhFqeG1E9ylG4OELaYIKsYUQum2M\
uAIBBAACiNjQIxil6E76j80v/0mx4T+xQczEQCIgWwOxMY81AvFGJguRsY3VD4wE\
QotgKP1HYzMS8gMjtrREyA8YfgII0FsV5AAAgqDh+v+X6e6WilmeHaAwlcPXqSX2\
VxXhRDI5EsOn8aJMCWF3taam/YfxsunRpebkdKaqEvxgRoIk1iyAlyIcEcEBenBc\
Hd9AxLF3A5g/QXMRQYn9AAAAAElFTkSuQmCC",
        "IOFF":
"iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAAGz7rX1AAAAGXRFWHRTb2Z0d2Fy\
ZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAR1JREFUeNpi/P//PwMyYILS/6GYgQUq\
wIiuAg4AAogR2QwWmD6YUkaYXmR9jAABhKznP7p5TDgkGLC6B6oQzAcIIEZ076Dr\
wmkXBsAl8R/FH0g0hlGMMPuYsDgZzAYIIJzORbcTWRMLvtAh5BtGItWjRD2KZ7D4\
HmtI41P4n1CaQrftP1JCgosDBBCxoUcwStGd9h+bX/6TYsN/YoOYiYFEQLYGYmMe\
awTijXUWImKbEZnNRES6+o+skeqhhJGemAj4ASPrAgQYyYmPHMBConpiXcSIyxJq\
euk/3kqDFoCJUNlEoW8YiEkpAxLxJEc6vpL6PzV9x0Sqq/CVx1j4eIMLoyAh4Ij/\
+BzFRIIB+HzCiOYwygpfXBkOi8PgcgAWCEVu1YMrAQAAAABJRU5ErkJggg=="
    }
};

log("Script loaded");
var flagger2ch = new Flagger2ch();
flagger2ch.init();
