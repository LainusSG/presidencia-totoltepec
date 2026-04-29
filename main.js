const GOVERNMENT_LINKS = [
    { href: "#", label: "Mensaje del Presidente Municipal" },
    { href: "organigrama.html", label: "Organigrama" },
    { href: "etica.html", label: "C&oacute;digo de &Eacute;tica" },
    { href: "tabulador.html", label: "Tabulador de sueldos" },
    { href: "reglamento.html", label: "Reglamento Interno" },
    { href: "conducta.html", label: "C&oacute;digo de Conducta" },
    { href: "procedimientos.html", label: "Manual de Organizaci&oacute;n y Procedimientos" },
    { href: "contratacion.html", label: "Manual de Procedimientos de Contrataci&oacute;n" },
    { href: "cabildo.html", label: "Reglamento Interior de Cabildo y Comisiones" },
    { href: "contabilidad.html", label: "Manual de Contabilidad 2024-2027" },
    { href: "desarrollo.html", label: "Plan de Desarrollo Municipal" },
    { href: "comite.html", label: "Comit&eacute; de Administraci&oacute;n de Riesgos" },
    { href: "1er_informe.html", label: "Primer Informe de Gobierno" }
];

const SERVICE_GROUPS = [
    {
        itemClass: "secre-secre",
        label: "Secretar&iacute;a",
        wrapperClass: "vertical-secre",
        listClass: "secre activo",
        links: [
            { href: "#tarjeta-identidad", label: "Constancia de Identidad" },
            { href: "#tarjeta-origen", label: "Constancia de Origen" },
            { href: "#tarjeta-vecindad", label: "Constancia de Vecindad" },
            { href: "#tarjeta-residencia", label: "Constancia de Residencia" },
            { href: "#tarjeta-persona", label: "Constancia de ser la Misma Persona" },
            { href: "#tarjeta-adeudo", label: "Constancia de no Adeudo" }
        ]
    },
    {
        itemClass: "civil-civil",
        label: "Registro Civil",
        wrapperClass: "vertical-vertical",
        listClass: "vertical-civil activo",
        links: [
            { href: "#tarjeta-nacimiento", label: "Registro de Nacimiento" },
            { href: "#tarjeta-hijos", label: "Reconocimiento de Hijos" },
            { href: "#tarjeta-matrimonio", label: "Registro de Matrimonio" },
            { href: "#tarjeta-defuncion", label: "Registro de Defunci&oacute;n" },
            { href: "#tarjeta-estractos", label: "Expedici&oacute;n de Extractos" }
        ]
    },
    {
        itemClass: "teso-teso",
        label: "Tesorer&iacute;a",
        wrapperClass: "vertical-teso",
        listClass: "teso activo",
        links: [
            { href: "#tarjeta-pago-potable", label: "Pago de Agua Potable" },
            { href: "#tarjeta-contrato-potable", label: "Contrato de Agua Potable" },
            { href: "#tarjeta-predial", label: "Pago del Impuesto Predial" }
        ]
    }
];

const SERVICE_MODALS = [
    {
        id: "tarjeta-identidad",
        items: ["INE ORIGINAL", "UNA FOTOGRAFIA TAMA&Ntilde;O INFANTIL"]
    },
    { id: "tarjeta-origen", items: ["COPIA DE INE"] },
    { id: "tarjeta-vecindad", items: ["COPIA DE INE"] },
    { id: "tarjeta-residencia", items: ["COPIA DE INE"] },
    {
        id: "tarjeta-persona",
        items: ["ACTA DE NACIMIENTO ORIGINAL", "INE ORIGINAL"]
    },
    { id: "tarjeta-adeudo", items: ["COPIA DE INE"] },
    {
        id: "tarjeta-nacimiento",
        items: [
            "ORIGINAL DEL CERTIFICADO DE NACIMIENTO",
            "ACTA DE NACIMIENTO ACTUALIZADO ORIGINAL Y COPIA DE LOS PADRES",
            "INE DE LOS PADRES",
            "CURP ACTUALIZADA DE LOS PADRES",
            "DOS TESTIGOS"
        ]
    },
    {
        id: "tarjeta-hijos",
        items: [
            "REGISTRO DE NACIMIENTO ORIGINAL",
            "ACTA DE NACIMIENTO ORIGINAL Y LA COPIA DEL RECONOCEDOR (A)",
            "INE DEL RECONOCEDOR (A)",
            "CURP ACTUALIZADA DEL RECONOCEDOR (A)",
            "INE Y CURP DE LA QUE OTORGA EL CONSENTIMIENTO PARA EL RECONOCIMIENTO",
            "DOS TESTIGOS"
        ]
    },
    {
        id: "tarjeta-matrimonio",
        items: [
            "ANALISIS PRENUPCIALES POR CADA UNO DE LOS CONTRAYENTES",
            "ACTA DE NACIMIENTO ORIGINAL Y COPIA DE CADA UNO DE LOS CONTRAYENTES",
            "INE ORIGINAL Y COPIA DE CADA UNO DE LOS CONTRAYENTES",
            "CURP ACTUALIZADA DE CADA UNO DE LOS CONTRAYENTES",
            "DOS TESTIGOS DE CADA UNO DE LOS CONTRAYENTES"
        ]
    },
    {
        id: "tarjeta-defuncion",
        items: [
            "ORIGINAL DEL CERTIFICADO DE DEFUNCION",
            "ORIGINAL DEL ACTA DE NACIMIENTO DEL FINADO",
            "INE DEL FINADO",
            "CURP DEL FINADO",
            "DECLARANTE Y DOS TESTIGOS CON INE"
        ]
    },
    {
        id: "tarjeta-estractos",
        items: ["PRESENTAR COPIA DEL ACTA ANTERIOR O CURP"]
    },
    {
        id: "tarjeta-pago-potable",
        items: [
            "PRESENTAR ULTIMO RECIBO DE PAGO",
            "COPIA DE INAPAM EN CASO DE PERTENECER A LA TERCERA EDAD PARA APLICAR EL DESCUENTO CORRESPONDIENTE"
        ]
    },
    {
        id: "tarjeta-contrato-potable",
        items: ["INE ORIGINAL Y COPIA", "COMPROBANTE DE DOMICILIO"]
    },
    {
        id: "tarjeta-predial",
        items: ["PRESENTAR ULTIMO COMPROBANTE DE PAGO"]
    }
];

function buildMenuLinks(items) {
    return items.map(function(item) {
        return `<li class="menus"><a href="${item.href}">${item.label}</a></li>`;
    }).join("");
}

function buildHeaderHtml() {
    const serviceGroupsMarkup = SERVICE_GROUPS.map(function(group) {
        return `
                    <li class="${group.itemClass}">
                        <a href="#">${group.label}</a>
                        <div class="${group.wrapperClass}">
                            <ul class="${group.listClass}">
                                ${buildMenuLinks(group.links)}
                            </ul>
                        </div>
                    </li>`;
    }).join("");

    return `
    <nav class="main-navbar">
        <ul class="menu">
            <li class="menus"><a href="index.html">INICIO</a></li>
            <li class="uno activo">
                <a href="#">GOBIERNO</a>
                <ul class="menu-vertical">
                    ${buildMenuLinks(GOVERNMENT_LINKS)}
                </ul>
            </li>
            <li class="menus activo">
                <a href="#">TRAM. Y SERV.</a>
                <ul class="menu-vertical2">
                    ${serviceGroupsMarkup}
                </ul>
            </li>
            <li class="menus"><a href="transparencia.html">TRANSPARENCIA</a></li>
            <li class="menus"><a href="#">CONTACTO</a></li>
        </ul>
    </nav>`;
}

function buildServiceModalsHtml() {
    return SERVICE_MODALS.map(function(modal) {
        const items = modal.items.map(function(item) {
            return `<li>${item}</li>`;
        }).join("");

        return `
    <div id="${modal.id}" class="modal">
        <div class="modal-content">
            <div class="close-todos"><a class="cerrar" href="">&times;</a></div>
            <h2>REQUISITOS</h2>
            <ul class="estilo">${items}</ul>
        </div>
    </div>`;
    }).join("");
}

function mountGlobalComponents() {
    document.querySelectorAll("site-header").forEach(function(node) {
        node.outerHTML = buildHeaderHtml();
    });

    document.querySelectorAll("service-modals").forEach(function(node) {
        node.outerHTML = buildServiceModalsHtml();
    });
}

mountGlobalComponents();

/* ----------------------------slider------------- */
const btnLeft = document.querySelector(".btn-left");
const btnRight = document.querySelector(".btn-right");
const slider = document.querySelector("#slider");
const sliderSection = document.querySelectorAll(".slider-section");

if (btnLeft && btnRight && slider && sliderSection.length) {
    let operacion = 0;
    let counter = 0;
    const widthImg = 100 / sliderSection.length;

    function moveToRight() {
        if (counter >= sliderSection.length - 1) {
            counter = 0;
            operacion = 0;
            slider.style.transform = `translate(-${operacion}%)`;
            slider.style.transition = "none";
            return;
        }
        counter++;
        operacion = operacion + widthImg;
        slider.style.transform = `translate(-${operacion}%)`;
        slider.style.transition = "all ease .6s";
    }

    function moveToLeft() {
        counter--;
        if (counter < 0) {
            counter = sliderSection.length - 1;
            operacion = widthImg * (sliderSection.length - 1);
            slider.style.transform = `translate(-${operacion}%)`;
            slider.style.transition = "none";
            return;
        }
        operacion = operacion - widthImg;
        slider.style.transform = `translate(-${operacion}%)`;
        slider.style.transition = "all ease .6s";
    }

    btnLeft.addEventListener("click", function() {
        moveToLeft();
    });

    btnRight.addEventListener("click", function() {
        moveToRight();
    });

    setInterval(function() {
        moveToRight();
    }, 5000);
}

/* ----------------------------mostrar y ocultar------------- */ 
function ocultar(){
    document.getElementById('menos').style.display='none';
    document.getElementById('mas').style.display='block';
    document.getElementById('transparencia').style.display='none';
}
function mostrar(){
    document.getElementById('menos').style.display='block';
    document.getElementById('mas').style.display='none';
    document.getElementById('transparencia').style.display='block';
}

function o(){
    document.getElementById('c2').style.display='none';
    document.getElementById('c1').style.display='block';
    document.getElementById('anterior').style.display='none';
    document.getElementById('c2021').style.display='none';
    document.getElementById('c2022').style.display='none';
    document.getElementById('c2023').style.display='none';
    document.getElementById('c2024').style.display='none';
}
function m(){
    document.getElementById('c2').style.display='block';
    document.getElementById('c1').style.display='none';
    document.getElementById('anterior').style.display='block';
    document.getElementById('c2021').style.display='block';
    document.getElementById('c2022').style.display='block';
    document.getElementById('c2023').style.display='block';
    document.getElementById('c2024').style.display='block';
}

function ocultar2(){
    document.getElementById('a2').style.display='none';
    document.getElementById('a1').style.display='block';
    document.getElementById('cuenta').style.display='none';
}
function mostrar1(){
    document.getElementById('a2').style.display='block';
    document.getElementById('a1').style.display='none';
    document.getElementById('cuenta').style.display='block';
}

function ocultar22(){
    document.getElementById('c22').style.display='none';
    document.getElementById('c11').style.display='block';
    document.getElementById('cuenta1').style.display='none';
}
function mostrar11(){
    document.getElementById('c22').style.display='block';
    document.getElementById('c11').style.display='none';
    document.getElementById('cuenta1').style.display='block';
}

function ocultar222(){
    document.getElementById('c222').style.display='none';
    document.getElementById('c111').style.display='block';
    document.getElementById('cuenta2022').style.display='none';
}
function mostrar111(){
    document.getElementById('c222').style.display='block';
    document.getElementById('c111').style.display='none';
    document.getElementById('cuenta2022').style.display='block';
}
function ocultar2222(){
    document.getElementById('c2222').style.display='none';
    document.getElementById('c1111').style.display='block';
    document.getElementById('cuenta2023').style.display='none';
}
function mostrar1111(){
    document.getElementById('c2222').style.display='block';
    document.getElementById('c1111').style.display='none';
    document.getElementById('cuenta2023').style.display='block';
}

function ocultar4(){
    document.getElementById('c4').style.display='none';
    document.getElementById('c3').style.display='block';
    document.getElementById('cuenta2024').style.display='none';
}
function mostrar3(){
    document.getElementById('c4').style.display='block';
    document.getElementById('c3').style.display='none';
    document.getElementById('cuenta2024').style.display='block';
}

function cp2(){
    document.getElementById('cp2').style.display='none';
    document.getElementById('cp1').style.display='block';
    document.getElementById('cp2021').style.display='none';
}
function cp1(){
    document.getElementById('cp2').style.display='block';
    document.getElementById('cp1').style.display='none';
    document.getElementById('cp2021').style.display='block';
}

function cp22(){
    document.getElementById('cp22').style.display='none';
    document.getElementById('cp11').style.display='block';
    document.getElementById('cp2022').style.display='none';
}
function cp11(){
    document.getElementById('cp22').style.display='block';
    document.getElementById('cp11').style.display='none';
    document.getElementById('cp2022').style.display='block';
}

function cp222(){
    document.getElementById('cp222').style.display='none';
    document.getElementById('cp111').style.display='block';
    document.getElementById('cp2023').style.display='none';
}
function cp111(){
    document.getElementById('cp222').style.display='block';
    document.getElementById('cp111').style.display='none';
    document.getElementById('cp2023').style.display='block';
}

function df2(){
    document.getElementById('df2').style.display='none';
    document.getElementById('df1').style.display='block';
    document.getElementById('df').style.display='none';
}
function df1(){
    document.getElementById('df2').style.display='block';
    document.getElementById('df1').style.display='none';
    document.getElementById('df').style.display='block';
}

function df22(){
    document.getElementById('df22').style.display='none';
    document.getElementById('df11').style.display='block';
    document.getElementById('df2022').style.display='none';
}
function df11(){
    document.getElementById('df22').style.display='block';
    document.getElementById('df11').style.display='none';
    document.getElementById('df2022').style.display='block';
}

function df222(){
    document.getElementById('df222').style.display='none';
    document.getElementById('df111').style.display='block';
    document.getElementById('df2023').style.display='none';
}
function df111(){
    document.getElementById('df222').style.display='block';
    document.getElementById('df111').style.display='none';
    document.getElementById('df2023').style.display='block';
}

function df2222(){
    document.getElementById('df2222').style.display='none';
    document.getElementById('df1111').style.display='block';
    document.getElementById('df2024').style.display='none';
}
function df1111(){
    document.getElementById('df2222').style.display='block';
    document.getElementById('df1111').style.display='none';
    document.getElementById('df2024').style.display='block';
}

function op2(){
    document.getElementById('op2').style.display='none';
    document.getElementById('op1').style.display='block';
    document.getElementById('op').style.display='none';
}
function op1(){
    document.getElementById('op2').style.display='block';
    document.getElementById('op1').style.display='none';
    document.getElementById('op').style.display='block';
}

function op22(){
    document.getElementById('op22').style.display='none';
    document.getElementById('op11').style.display='block';
    document.getElementById('op2022').style.display='none';
}
function op11(){
    document.getElementById('op22').style.display='block';
    document.getElementById('op11').style.display='none';
    document.getElementById('op2022').style.display='block';
}

function pae2(){
    document.getElementById('pae2').style.display='none';
    document.getElementById('pae1').style.display='block';
    document.getElementById('pae2024').style.display='none';
}
function pae1(){
    document.getElementById('pae2').style.display='block';
    document.getElementById('pae1').style.display='none';
    document.getElementById('pae2024').style.display='block';
}
function pag2(){
    document.getElementById('pag2').style.display='none';
    document.getElementById('pag1').style.display='block';
    document.getElementById('pag2024').style.display='none';
}
function pag1(){
    document.getElementById('pag2').style.display='block';
    document.getElementById('pag1').style.display='none';
    document.getElementById('pag2024').style.display='block';
}
function bie2(){
    document.getElementById('bie2').style.display='none';
    document.getElementById('bie1').style.display='block';
    document.getElementById('bie2024').style.display='none';
}
function bie1(){
    document.getElementById('bie2').style.display='block';
    document.getElementById('bie1').style.display='none';
    document.getElementById('bie2024').style.display='block';
}
function mon2(){
    document.getElementById('mon2').style.display='none';
    document.getElementById('mon1').style.display='block';
    document.getElementById('mon2024').style.display='none';
}
function mon1(){
    document.getElementById('mon2').style.display='block';
    document.getElementById('mon1').style.display='none';
    document.getElementById('mon2024').style.display='block';
}
function obl2(){
    document.getElementById('obl2').style.display='none';
    document.getElementById('obl1').style.display='block';
    document.getElementById('obl2024').style.display='none';
}
function obl1(){
    document.getElementById('obl2').style.display='block';
    document.getElementById('obl1').style.display='none';
    document.getElementById('obl2024').style.display='block';
}
function gas2(){
    document.getElementById('gas2').style.display='none';
    document.getElementById('gas1').style.display='block';
    document.getElementById('gas2024').style.display='none';
}
function gas1(){
    document.getElementById('gas2').style.display='block';
    document.getElementById('gas1').style.display='none';
    document.getElementById('gas2024').style.display='block';
}
function pro2(){
    document.getElementById('pro2').style.display='none';
    document.getElementById('pro1').style.display='block';
    document.getElementById('pro2024').style.display='none';
}
function pro1(){
    document.getElementById('pro2').style.display='block';
    document.getElementById('pro1').style.display='none';
    document.getElementById('pro2024').style.display='block';
}
function for2(){
    document.getElementById('for2').style.display='none';
    document.getElementById('for1').style.display='block';
    document.getElementById('for2024').style.display='none';
}
function for1(){
    document.getElementById('for2').style.display='block';
    document.getElementById('for1').style.display='none';
    document.getElementById('for2024').style.display='block';
}
function srf2(){
    document.getElementById('srf2').style.display='none';
    document.getElementById('srf1').style.display='block';
    document.getElementById('srf2024').style.display='none';
}
function srf1(){
    document.getElementById('srf2').style.display='block';
    document.getElementById('srf1').style.display='none';
    document.getElementById('srf2024').style.display='block';
}
function nom2(){
    document.getElementById('nom2').style.display='none';
    document.getElementById('nom1').style.display='block';
    document.getElementById('nom2024').style.display='none';
}
function nom1(){
    document.getElementById('nom2').style.display='block';
    document.getElementById('nom1').style.display='none';
    document.getElementById('nom2024').style.display='block';
}
function co252(){
    document.getElementById('co252').style.display='none';
    document.getElementById('co251').style.display='block';
    document.getElementById('c2025').style.display='none';
}
function co251(){
    document.getElementById('co252').style.display='block';
    document.getElementById('co251').style.display='none';
    document.getElementById('c2025').style.display='block';
}

function co262(){
    document.getElementById('co262').style.display='none';
    document.getElementById('co261').style.display='block';
    document.getElementById('c2026').style.display='none';
}
function co261(){
    document.getElementById('co262').style.display='block';
    document.getElementById('co261').style.display='none';
    document.getElementById('c2026').style.display='block';
}

function di252(){
    document.getElementById('di252').style.display='none';
    document.getElementById('di251').style.display='block';
    document.getElementById('di2025').style.display='none';
}

function di251(){
    document.getElementById('di252').style.display='block';
    document.getElementById('di251').style.display='none';
    document.getElementById('di2025').style.display='block';
}
function di262(){
    document.getElementById('di262').style.display='none';
    document.getElementById('di261').style.display='block';
    document.getElementById('di2026').style.display='none';
}

function di261(){
    document.getElementById('di262').style.display='block';
    document.getElementById('di261').style.display='none';
    document.getElementById('di2026').style.display='block';
}
function inv252(){
    document.getElementById('inv252').style.display='none';
    document.getElementById('inv251').style.display='block';
    document.getElementById('di2025').style.display='none';
}
function inv251(){
    document.getElementById('inv252').style.display='block';
    document.getElementById('inv251').style.display='none';
    document.getElementById('inv2025').style.display='block';
}
function inv262(){
    document.getElementById('inv262').style.display='none';
    document.getElementById('inv261').style.display='block';
    document.getElementById('di2026').style.display='none';
}
function inv261(){
    document.getElementById('inv262').style.display='block';
    document.getElementById('inv261').style.display='none';
    document.getElementById('inv2026').style.display='block';
}
function pag252(){
    document.getElementById('pag252').style.display='none';
    document.getElementById('pag251').style.display='block';
    document.getElementById('pag2025').style.display='none';
}
function pag251(){
    document.getElementById('pag252').style.display='block';
    document.getElementById('pag251').style.display='none';
    document.getElementById('pag2025').style.display='block';
}
function pag262(){
    document.getElementById('pag262').style.display='none';
    document.getElementById('pag261').style.display='block';
    document.getElementById('pag2026').style.display='none';
}
function pag261(){
    document.getElementById('pag262').style.display='block';
    document.getElementById('pag261').style.display='none';
    document.getElementById('pag2026').style.display='block';
}
function cp252(){
    document.getElementById('cp252').style.display='none';
    document.getElementById('cp251').style.display='block';
    document.getElementById('cp2024').style.display='none';
}
function cp251(){
    document.getElementById('cp252').style.display='block';
    document.getElementById('cp251').style.display='none';
    document.getElementById('cp2024').style.display='block';
}
function gas225(){
    document.getElementById('gas225').style.display='none';
    document.getElementById('gas125').style.display='block';
    document.getElementById('gas2025').style.display='none';
}
function gas125(){
    document.getElementById('gas225').style.display='block';
    document.getElementById('gas125').style.display='none';
    document.getElementById('gas2025').style.display='block';
}

function fais252(){
    document.getElementById('fais252').style.display='none';
    document.getElementById('fais251').style.display='block';
    document.getElementById('fais25').style.display='none';
}
function fais251(){
    document.getElementById('fais252').style.display='block';
    document.getElementById('fais251').style.display='none';
    document.getElementById('fais25').style.display='block';
}
function fede252(){
    document.getElementById('fede252').style.display='none';
    document.getElementById('fede251').style.display='block';
    document.getElementById('fede25').style.display='none';
}
function fede251(){
    document.getElementById('fede252').style.display='block';
    document.getElementById('fede251').style.display='none';
    document.getElementById('fede25').style.display='block';
}
function prc252(){
    document.getElementById('prc252').style.display='none';
    document.getElementById('prc251').style.display='block';
    document.getElementById('prc25').style.display='none';
}
function prc251(){
    document.getElementById('prc252').style.display='block';
    document.getElementById('prc251').style.display='none';
    document.getElementById('prc25').style.display='block';
}
function fort252(){
    document.getElementById('fort252').style.display='none';
    document.getElementById('fort251').style.display='block';
    document.getElementById('fort25').style.display='none';
}
function fort251(){
    document.getElementById('fort252').style.display='block';
    document.getElementById('fort251').style.display='none';
    document.getElementById('fort25').style.display='block';
}
function srf252(){
    document.getElementById('srf252').style.display='none';
    document.getElementById('srf251').style.display='block';
    document.getElementById('srf2025').style.display='none';
}
function srf251(){
    document.getElementById('srf252').style.display='block';
    document.getElementById('srf251').style.display='none';
    document.getElementById('srf2025').style.display='block';
}
function proae2(){
    document.getElementById('proae2').style.display='none';
    document.getElementById('proae1').style.display='block';
    document.getElementById('proae2025').style.display='none';
}
function proae1(){
    document.getElementById('proae2').style.display='block';
    document.getElementById('proae1').style.display='none';
    document.getElementById('proae2025').style.display='block';
}
function amon2(){
    document.getElementById('amon2').style.display='none';
    document.getElementById('amon1').style.display='block';
    document.getElementById('amon2425').style.display='none';
}
function amon1(){
    document.getElementById('amon2').style.display='block';
    document.getElementById('amon1').style.display='none';
    document.getElementById('amon2425').style.display='block';
}
