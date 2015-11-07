function qs(x) {
    return document.querySelector(x);
}

function qsa(x) {
    return document.querySelectorAll(x);
}

function padSwitcher(e) {
    if((e.target instanceof HTMLLIElement) && (!/pad-active/i.test(e.target.className))) {
        qs("li.pad-active").classList.remove("pad-active");
        qs(".pad-content.pad-active").classList.remove("pad-active");
        e.target.classList.add("pad-active");
        i = Array.prototype.indexOf.call(e.target.parentElement.children, e.target);
        qsa(".pad-content")[i].classList.add("pad-active");
    }
}

function testInput(t) {
    switch(t) {
        case 0:
            if(qs('#icon-input-os').files[0] && (qs("#os-code").value.length > 0) && (qs("#os-name").value.length > 0)) {
                encodeIcon(0);
                qs("#code-os").setAttribute("value", "\"" + qs("#os-name").value + "\": \"" + qs("#os-code").value + "\"");
                qs("#os-base64").value = "\"" + qs("#os-code").value + "\":\n\"";
                qs("#os-preview").classList.add("active");
            } else {
                qs("#code-os").setAttribute("value", "");
                qs("#os-base64").setAttribute("value", "");
                qs("#os-preview").classList.remove("active");
            }

            break;
        case 1:
            if(qs('#icon-input-br').files[0] && (qs("#br-code").value.length > 0) && (qs("#br-name").value.length > 0)) {
                encodeIcon(1);
                qs("#code-br").setAttribute("value", "\"" + qs("#br-name").value + "\": \"" + qs("#br-code").value + "\"");
                qs("#br-base64").value = "\"" + qs("#br-code").value + "\":\n\"";
                qs("#br-preview").classList.add("active");
            } else {
                qs("#code-br").setAttribute("value", "");
                qs("#br-base64").setAttribute("value", "");
                qs("#br-preview").classList.remove("active");
            }

            break;
    }
}

function encodeIcon(target) {
    var preview;
    var b64code;
    var file;
    var reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
        dataless = reader.result.replace("data:image/png;base64,","");
        data_split = dataless.match(/.{1,64}/g);
        for(i = 0; i < data_split.length-1; i++) 
            b64code.value +=  data_split[i] + "\\\n";
        b64code.value += data_split[data_split.length-1] + "\"";
    };

    switch (target) {
        case 0:
            preview = qs('#os-preview img');
            file = qs('#icon-input-os').files[0];
            b64code = qs('#os-base64');
            break;
        case 1:

            preview = qs('#br-preview img');
            file = qs('#icon-input-br').files[0];
            b64code = qs('#br-base64');            
            break
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
}

function resetForm(t) {
    switch (t) {
        case 0:
            qs("#icon-input-os").value = "";
            qs("#os-code").value = "";
            qs("#os-name").value = "";
            qs("#icon-input-os").onchange();
            break;
        case 1:
            qs("#icon-input-br").value = "";
            qs("#br-code").value = "";
            qs("#br-name").value = "";
            qs("#icon-input-br").onchange();
            break;
    }
}

qs(".pads").addEventListener("click", padSwitcher);
