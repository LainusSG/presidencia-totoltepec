(function() {
    "use strict";

    const ADMIN_SESSION_KEY = "totoltepec.transparencia.admin";
    const DATA_KEY = "totoltepec.transparencia.data.v2";
    const PDF_KEY = "totoltepec.transparencia.pdfs.v2";

    let data = null;
    let pdfs = [];
    let isAdmin = false;

    function initTransparenciaAdmin() {
        const info = document.querySelector(".articulo .articulo2 .info");

        if (!info) {
            return;
        }

        isAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
        data = loadJson(DATA_KEY);

        if (!isAdmin && !data) {
            return;
        }

        if (!data) {
            data = parseTransparencia(info);
        }

        pdfs = mergePdfs(loadJson(PDF_KEY) || [], collectPdfs(data.nodes));

        render(info);
    }

    function parseTransparencia(info) {
        const parsed = {
            introHtml: "",
            nodes: []
        };
        let currentTop = null;
        let currentSection = null;

        Array.from(info.children).forEach(function(child) {
            if (child.classList.contains("orga")) {
                const title = getOrgaTitle(child);

                if (title === "TRANSPARENCIA") {
                    currentSection = null;
                    return;
                }

                if (!title) {
                    currentSection = currentTop;
                    return;
                }

                if (!currentTop) {
                    currentTop = createNode("GENERAL");
                    parsed.nodes.push(currentTop);
                }

                currentSection = createNode(title);
                currentTop.children.push(currentSection);
                return;
            }

            if (!child.classList.contains("pdf")) {
                return;
            }

            if (child.id === "transparencia") {
                parsed.introHtml = child.innerHTML;
                return;
            }

            if (isCategoryBlock(child)) {
                currentTop = createNode(cleanText(child.textContent));
                currentSection = currentTop;
                parsed.nodes.push(currentTop);
                return;
            }

            if (child.querySelector("a[href], h1, h2, h3, h4, h5, h6")) {
                readDocumentsBlock(child, currentSection || currentTop || ensureGeneral(parsed.nodes));
            }
        });

        return parsed;
    }

    function getOrgaTitle(element) {
        const title = element.querySelector(".organigrama");
        return cleanText(title ? title.textContent : element.textContent);
    }

    function isCategoryBlock(element) {
        return element.id === "conac" && !element.querySelector("a[href]") && !element.querySelector("h1, h2, h3, h4, h5, h6");
    }

    function readDocumentsBlock(block, parentNode) {
        let activeNode = parentNode;

        Array.from(block.children).forEach(function(child) {
            const tag = child.tagName ? child.tagName.toLowerCase() : "";

            if (/^h[1-6]$/.test(tag)) {
                activeNode = createNode(cleanText(child.textContent));
                parentNode.children.push(activeNode);
                return;
            }

            if (tag === "p" && !child.closest("a")) {
                const text = cleanText(child.textContent);

                if (text) {
                    activeNode = createNode(text);
                    parentNode.children.push(activeNode);
                }

                return;
            }

            if (tag === "a") {
                addDocument(activeNode, child);
                return;
            }

            child.querySelectorAll("a[href]").forEach(function(link) {
                addDocument(activeNode, link);
            });
        });
    }

    function addDocument(node, link) {
        const href = cleanPath(link.getAttribute("href") || "");
        const title = cleanText(link.textContent) || getFileName(href) || "DOCUMENTO";

        node.documents.push({
            id: createId(),
            title: title,
            href: href
        });
    }

    function render(info) {
        info.innerHTML = "";

        if (isAdmin) {
            renderAdminPanel(info);
        }

        renderIntro(info);
        data.nodes.forEach(function(node) {
            renderNode(info, node, 0);
        });
    }

    function renderIntro(info) {
        if (!data.introHtml) {
            return;
        }

        const header = document.createElement("div");
        header.className = "orga";

        const title = document.createElement("a");
        title.className = "organigrama";
        title.textContent = "TRANSPARENCIA";

        const show = document.createElement("button");
        show.type = "button";
        show.textContent = "+";

        const hide = document.createElement("button");
        hide.type = "button";
        hide.textContent = "-";

        const body = document.createElement("div");
        body.className = "pdf";
        body.innerHTML = data.introHtml;

        show.style.display = "block";
        hide.style.display = "none";
        body.style.display = "none";

        show.addEventListener("click", function() {
            show.style.display = "none";
            hide.style.display = "block";
            body.style.display = "block";
        });

        hide.addEventListener("click", function() {
            hide.style.display = "none";
            show.style.display = "block";
            body.style.display = "none";
        });

        header.appendChild(title);
        header.appendChild(show);
        header.appendChild(hide);
        info.appendChild(header);
        info.appendChild(body);
    }

    function renderAdminPanel(info) {
        const panel = document.createElement("div");
        panel.className = "trans-admin-toolbar";

        const title = document.createElement("p");
        title.textContent = "ADMINISTRADOR TRANSPARENCIA";

        const addHeader = createIconButton("Crear encabezado", "plus", "trans-admin-action--create trans-admin-action--top");
        addHeader.addEventListener("click", createHeaderFromPrompt);

        const close = document.createElement("button");
        close.type = "button";
        close.className = "trans-admin-close";
        close.textContent = "CERRAR SESION";
        close.addEventListener("click", function() {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            window.location.href = "transparencia.html";
        });

        panel.appendChild(title);
        panel.appendChild(close);
        panel.appendChild(addHeader);
        info.appendChild(panel);
    }

    function buildAdminActionPanel() {
        const wrapper = document.createElement("div");
        const label = createLabel("SELECCIONA QUE HACER");
        const action = document.createElement("select");
        const formArea = document.createElement("div");
        const options = [
            { value: "", text: "SELECCIONAR" },
            { value: "crear", text: "CREAR" },
            { value: "editar", text: "EDITAR" },
            { value: "borrar", text: "BORRAR" }
        ];

        options.forEach(function(item) {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.text;
            action.appendChild(option);
        });

        action.addEventListener("change", function() {
            formArea.innerHTML = "";

            if (action.value === "crear") {
                formArea.appendChild(buildCreateThreeLevelForm());
            }

            if (action.value === "editar") {
                formArea.appendChild(buildEditOptionsForm());
            }

            if (action.value === "borrar") {
                formArea.appendChild(buildDeleteOptionsForm());
            }
        });

        wrapper.appendChild(label);
        wrapper.appendChild(action);
        wrapper.appendChild(formArea);
        return wrapper;
    }

    function buildCreateThreeLevelForm() {
        const form = createFormTitle("CREAR ENCABEZADO, SUBNIVEL Y REGISTRO");
        const headerSelect = createHeaderChoiceSelect();
        const newHeader = createInput("NUEVO ENCABEZADO");
        const sublevelSelect = document.createElement("select");
        const newSublevel = createInput("NUEVO SUBNIVEL");
        const record = createInput("REGISTRO");
        const pdfSelect = createPdfSelect();
        const path = createInput("RUTA PDF");
        const file = document.createElement("input");
        file.type = "file";
        file.accept = "application/pdf,.pdf";

        form.appendChild(createLabel("ENCABEZADO"));
        form.appendChild(headerSelect);
        form.appendChild(newHeader.label);
        form.appendChild(newHeader.input);
        form.appendChild(createLabel("SUBNIVEL"));
        form.appendChild(sublevelSelect);
        form.appendChild(newSublevel.label);
        form.appendChild(newSublevel.input);
        form.appendChild(record.label);
        form.appendChild(record.input);
        form.appendChild(createLabel("PDF EXISTENTE"));
        form.appendChild(pdfSelect);
        form.appendChild(path.label);
        form.appendChild(path.input);
        form.appendChild(file);
        form.appendChild(createSubmit("CREAR"));

        function updateNewHeaderVisibility() {
            const showNewHeader = headerSelect.value === "__nuevo__";
            newHeader.label.style.display = showNewHeader ? "block" : "none";
            newHeader.input.style.display = showNewHeader ? "inline-block" : "none";
        }

        function updateNewSublevelVisibility() {
            const showNewSublevel = sublevelSelect.value === "__nuevo__";
            newSublevel.label.style.display = showNewSublevel ? "block" : "none";
            newSublevel.input.style.display = showNewSublevel ? "inline-block" : "none";
        }

        function updateSublevelOptions() {
            const headerNode = findNode(headerSelect.value);
            sublevelSelect.innerHTML = "";

            if (headerNode) {
                headerNode.children.forEach(function(node) {
                    const option = document.createElement("option");
                    option.value = node.id;
                    option.textContent = node.title;
                    sublevelSelect.appendChild(option);
                });
            }

            const newOption = document.createElement("option");
            newOption.value = "__nuevo__";
            newOption.textContent = "NUEVO SUBNIVEL";
            sublevelSelect.appendChild(newOption);

            if (!headerNode || !headerNode.children.length) {
                sublevelSelect.value = "__nuevo__";
            }

            updateNewSublevelVisibility();
        }

        headerSelect.addEventListener("change", function() {
            updateNewHeaderVisibility();
            updateSublevelOptions();
        });

        sublevelSelect.addEventListener("change", updateNewSublevelVisibility);

        updateNewHeaderVisibility();
        updateSublevelOptions();

        file.addEventListener("change", function() {
            if (file.files && file.files[0]) {
                path.input.value = "pdf/" + file.files[0].name;

                if (!record.input.value) {
                    record.input.value = file.files[0].name.replace(/\.pdf$/i, "");
                }
            }
        });

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const headerNode = headerSelect.value === "__nuevo__" ? null : findNode(headerSelect.value);
            const headerTitle = headerNode ? headerNode.title : cleanText(newHeader.input.value);
            const sublevelNode = sublevelSelect.value === "__nuevo__" ? null : findNode(sublevelSelect.value);
            const sublevelTitle = sublevelNode ? sublevelNode.title : cleanText(newSublevel.input.value);
            const recordTitle = cleanText(record.input.value);
            const href = cleanPath(path.input.value || pdfSelect.value);

            if (!headerTitle || !sublevelTitle || !recordTitle) {
                alert("ESCRIBE ENCABEZADO, SUBNIVEL Y REGISTRO");
                return;
            }

            const finalHeaderNode = headerNode || findTopNodeByTitle(headerTitle) || createTopNode(headerTitle);
            const finalSublevelNode = sublevelNode || findDirectChildByTitle(finalHeaderNode, sublevelTitle) || createChildNode(finalHeaderNode, sublevelTitle);

            finalSublevelNode.documents.push({
                id: createId(),
                title: recordTitle,
                href: href
            });

            if (href) {
                addPdf(recordTitle, href);
            }

            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function buildEditOptionsForm() {
        const wrapper = document.createElement("div");
        const title = document.createElement("h4");
        const action = document.createElement("select");
        const formArea = document.createElement("div");
        const options = [
            { value: "", text: "SELECCIONAR" },
            { value: "agregar-subnivel", text: "AGREGAR SUBNIVEL" },
            { value: "agregar-registro", text: "AGREGAR REGISTRO" }
        ];

        title.textContent = "EDITAR";
        wrapper.appendChild(title);
        wrapper.appendChild(createLabel("SELECCIONA QUE EDITAR"));

        options.forEach(function(item) {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.text;
            action.appendChild(option);
        });

        action.addEventListener("change", function() {
            formArea.innerHTML = "";

            if (action.value === "agregar-subnivel") {
                formArea.appendChild(buildAddSublevelForm());
            }

            if (action.value === "agregar-registro") {
                formArea.appendChild(buildAddRecordForm());
            }
        });

        wrapper.appendChild(action);
        wrapper.appendChild(formArea);
        return wrapper;
    }

    function buildDeleteOptionsForm() {
        const wrapper = document.createElement("div");
        const title = document.createElement("h4");
        const action = document.createElement("select");
        const formArea = document.createElement("div");
        const options = [
            { value: "", text: "SELECCIONAR" },
            { value: "registro", text: "BORRAR REGISTRO" },
            { value: "subnivel", text: "BORRAR SUBNIVEL" },
            { value: "encabezado", text: "BORRAR ENCABEZADO" }
        ];

        title.textContent = "BORRAR";
        wrapper.appendChild(title);
        wrapper.appendChild(createLabel("SELECCIONA QUE BORRAR"));

        options.forEach(function(item) {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.text;
            action.appendChild(option);
        });

        action.addEventListener("change", function() {
            formArea.innerHTML = "";

            if (action.value === "registro") {
                formArea.appendChild(buildDeleteDocumentForm());
            }

            if (action.value === "subnivel") {
                formArea.appendChild(buildDeleteSublevelForm());
            }

            if (action.value === "encabezado") {
                formArea.appendChild(buildDeleteHeaderForm());
            }
        });

        wrapper.appendChild(action);
        wrapper.appendChild(formArea);
        return wrapper;
    }

    function buildAddSublevelForm() {
        const form = createFormTitle("AGREGAR SUBNIVEL");
        const header = createHeaderSelect();
        const sublevel = createInput("SUBNIVEL");

        form.appendChild(createLabel("ENCABEZADO"));
        form.appendChild(header);
        form.appendChild(sublevel.label);
        form.appendChild(sublevel.input);
        form.appendChild(createSubmit("AGREGAR SUBNIVEL"));

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const headerNode = findNode(header.value);
            const title = cleanText(sublevel.input.value);

            if (!headerNode || !title) {
                alert("SELECCIONA UN ENCABEZADO Y ESCRIBE EL SUBNIVEL");
                return;
            }

            if (!findDirectChildByTitle(headerNode, title)) {
                createChildNode(headerNode, title);
            }

            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function buildAddRecordForm() {
        const form = createFormTitle("AGREGAR REGISTRO");
        const sublevel = createSublevelSelect();
        const record = createInput("REGISTRO");
        const pdfSelect = createPdfSelect();
        const path = createInput("RUTA PDF");
        const file = document.createElement("input");
        file.type = "file";
        file.accept = "application/pdf,.pdf";

        form.appendChild(createLabel("SUBNIVEL"));
        form.appendChild(sublevel);
        form.appendChild(record.label);
        form.appendChild(record.input);
        form.appendChild(createLabel("PDF EXISTENTE"));
        form.appendChild(pdfSelect);
        form.appendChild(path.label);
        form.appendChild(path.input);
        form.appendChild(file);
        form.appendChild(createSubmit("AGREGAR REGISTRO"));

        file.addEventListener("change", function() {
            if (file.files && file.files[0]) {
                path.input.value = "pdf/" + file.files[0].name;

                if (!record.input.value) {
                    record.input.value = file.files[0].name.replace(/\.pdf$/i, "");
                }
            }
        });

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const sublevelNode = findNode(sublevel.value);
            const title = cleanText(record.input.value);
            const href = cleanPath(path.input.value || pdfSelect.value);

            if (!sublevelNode || !title) {
                alert("SELECCIONA UN SUBNIVEL Y ESCRIBE EL REGISTRO");
                return;
            }

            sublevelNode.documents.push({
                id: createId(),
                title: title,
                href: href
            });

            if (href) {
                addPdf(title, href);
            }

            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function buildEditSectionForm() {
        const form = createFormTitle("EDITAR APARTADO");
        const target = createNodeSelect(false);
        const name = createInput("NUEVO NOMBRE");

        form.appendChild(createLabel("APARTADO"));
        form.appendChild(target);
        form.appendChild(name.label);
        form.appendChild(name.input);
        form.appendChild(createSubmit("EDITAR"));

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const node = findNode(target.value);
            const title = cleanText(name.input.value);

            if (!node || !title) {
                alert("SELECCIONA UN APARTADO Y ESCRIBE EL NOMBRE");
                return;
            }

            node.title = title;
            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function buildDeleteSectionForm() {
        const form = createFormTitle("BORRAR APARTADO");
        const target = createNodeSelect(false);

        form.appendChild(createLabel("APARTADO"));
        form.appendChild(target);
        form.appendChild(createSubmit("BORRAR"));

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const node = findNode(target.value);

            if (!node) {
                alert("SELECCIONA UN APARTADO");
                return;
            }

            if (!confirm("BORRAR " + node.title + "? NO SE BORRAN LOS PDF")) {
                return;
            }

            removeNode(target.value, data.nodes);
            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }
    function buildEditDocumentForm() {
        const form = createFormTitle("EDITAR REGISTRO");
        const target = createDocumentSelect();
        const name = createInput("NUEVO NOMBRE");
        const path = createInput("RUTA PDF");

        form.appendChild(createLabel("REGISTRO"));
        form.appendChild(target);
        form.appendChild(name.label);
        form.appendChild(name.input);
        form.appendChild(path.label);
        form.appendChild(path.input);
        form.appendChild(createSubmit("EDITAR REGISTRO"));

        target.addEventListener("change", function() {
            const doc = findDocumentBySelectValue(target.value);

            if (doc) {
                name.input.value = doc.document.title;
                path.input.value = doc.document.href;
            }
        });

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const found = findDocumentBySelectValue(target.value);
            const title = cleanText(name.input.value);

            if (!found || !title) {
                alert("SELECCIONA UN REGISTRO Y ESCRIBE EL NOMBRE");
                return;
            }

            found.document.title = title;
            found.document.href = cleanPath(path.input.value);

            if (found.document.href) {
                addPdf(found.document.title, found.document.href);
            }

            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function buildDeleteDocumentForm() {
        const form = createFormTitle("BORRAR REGISTRO");
        const target = createDocumentSelect();

        form.appendChild(createLabel("REGISTRO"));
        form.appendChild(target);
        form.appendChild(createSubmit("BORRAR REGISTRO"));

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const found = findDocumentBySelectValue(target.value);

            if (!found) {
                alert("SELECCIONA UN REGISTRO");
                return;
            }

            if (!confirm("BORRAR " + found.document.title + "? NO SE BORRA EL PDF")) {
                return;
            }

            found.parent.documents = found.parent.documents.filter(function(documentItem) {
                return documentItem.id !== found.document.id;
            });

            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function buildDeleteSublevelForm() {
        const form = createFormTitle("BORRAR SUBNIVEL");
        const target = createSublevelSelect();

        form.appendChild(createLabel("SUBNIVEL"));
        form.appendChild(target);
        form.appendChild(createSubmit("BORRAR SUBNIVEL"));

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const node = findNode(target.value);

            if (!node) {
                alert("SELECCIONA UN SUBNIVEL");
                return;
            }

            if (!confirm("BORRAR " + node.title + "? NO SE BORRAN LOS PDF")) {
                return;
            }

            removeNode(target.value, data.nodes);
            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function buildDeleteHeaderForm() {
        const form = createFormTitle("BORRAR ENCABEZADO");
        const target = createHeaderSelect();

        form.appendChild(createLabel("ENCABEZADO"));
        form.appendChild(target);
        form.appendChild(createSubmit("BORRAR ENCABEZADO"));

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const node = findNode(target.value);

            if (!node) {
                alert("SELECCIONA UN ENCABEZADO");
                return;
            }

            if (!confirm("BORRAR " + node.title + "? NO SE BORRAN LOS PDF")) {
                return;
            }

            removeNode(target.value, data.nodes);
            saveData();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function buildPdfForm() {
        const form = createFormTitle("REGISTRAR PDF");
        const name = createInput("NOMBRE");
        const path = createInput("RUTA PDF");
        const file = document.createElement("input");
        file.type = "file";
        file.accept = "application/pdf,.pdf";

        form.appendChild(name.label);
        form.appendChild(name.input);
        form.appendChild(path.label);
        form.appendChild(path.input);
        form.appendChild(file);
        form.appendChild(createSubmit("REGISTRAR PDF"));

        file.addEventListener("change", function() {
            if (file.files && file.files[0]) {
                path.input.value = "pdf/" + file.files[0].name;
                if (!name.input.value) {
                    name.input.value = file.files[0].name.replace(/\.pdf$/i, "");
                }
            }
        });

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            const href = cleanPath(path.input.value);

            if (!href) {
                alert("ESCRIBE LA RUTA DEL PDF");
                return;
            }

            addPdf(cleanText(name.input.value) || getFileName(href), href);
            savePdfs();
            render(document.querySelector(".articulo .articulo2 .info"));
        });

        return form;
    }

    function renderNode(container, node, depth) {
        if (depth === 0) {
            const category = document.createElement("div");
            category.className = isAdmin ? "pdf trans-node-row trans-node-row--header" : "pdf";
            category.id = "conac";
            const title = document.createElement("p");
            title.textContent = node.title;
            category.appendChild(title);

            if (isAdmin) {
                category.appendChild(createNodeActions(node, "encabezado"));
            }

            container.appendChild(category);

            renderDocuments(container, node);
            node.children.forEach(function(child) {
                renderNode(container, child, depth + 1);
            });
            return;
        }

        const header = document.createElement("div");
        header.className = isAdmin ? "orga trans-node-row trans-node-row--sublevel" : "orga";

        const title = document.createElement("a");
        title.className = "organigrama";
        title.textContent = node.title;

        const show = document.createElement("button");
        show.type = "button";
        show.textContent = "+";

        const hide = document.createElement("button");
        hide.type = "button";
        hide.textContent = "-";

        const body = document.createElement("div");
        body.className = "pdf";
        body.style.display = "none";
        hide.style.display = "none";

        show.addEventListener("click", function() {
            show.style.display = "none";
            hide.style.display = "block";
            body.style.display = "block";
        });

        hide.addEventListener("click", function() {
            hide.style.display = "none";
            show.style.display = "block";
            body.style.display = "none";
        });

        header.appendChild(title);
        if (isAdmin) {
            header.appendChild(createNodeActions(node, "subnivel"));
        }
        header.appendChild(show);
        header.appendChild(hide);
        container.appendChild(header);

        renderDocuments(body, node);
        node.children.forEach(function(child) {
            renderNode(body, child, depth + 1);
        });

        container.appendChild(body);
    }

    function renderDocuments(container, node) {
        node.documents.forEach(function(documentItem) {
            if (isAdmin) {
                const row = document.createElement("div");
                row.className = "trans-record-row";

                if (documentItem.href) {
                    const link = document.createElement("a");
                    link.href = documentItem.href;
                    const text = document.createElement("p");
                    text.textContent = documentItem.title;
                    link.appendChild(text);
                    row.appendChild(link);
                } else {
                    const paragraph = document.createElement("p");
                    paragraph.textContent = documentItem.title;
                    row.appendChild(paragraph);
                }

                row.appendChild(createDocumentActions(node, documentItem));
                container.appendChild(row);
                return;
            }

            if (documentItem.href) {
                const link = document.createElement("a");
                link.href = documentItem.href;
                const text = document.createElement("p");
                text.textContent = documentItem.title;
                link.appendChild(text);
                container.appendChild(link);
                return;
            }

            const paragraph = document.createElement("p");
            paragraph.textContent = documentItem.title;
            container.appendChild(paragraph);
        });
    }

    function createNodeActions(node, type) {
        const actions = document.createElement("div");
        actions.className = "trans-admin-actions";

        const edit = createIconButton("Editar " + type, "edit", "trans-admin-action--edit");
        edit.addEventListener("click", function() {
            editNodeName(node, type);
        });

        const remove = createIconButton("Borrar " + type, "trash", "trans-admin-action--delete");
        remove.addEventListener("click", function() {
            deleteNodeWithConfirm(node, type);
        });

        const create = createIconButton(
            type === "encabezado" ? "Crear subnivel" : "Crear registro",
            "plus",
            "trans-admin-action--create"
        );
        create.addEventListener("click", function() {
            if (type === "encabezado") {
                createSublevelFromPrompt(node);
                return;
            }

            createRecordFromPrompt(node);
        });

        actions.appendChild(edit);
        actions.appendChild(remove);
        actions.appendChild(create);
        return actions;
    }

    function createDocumentActions(parent, documentItem) {
        const actions = document.createElement("div");
        actions.className = "trans-admin-actions";

        const edit = createIconButton("Editar registro", "edit", "trans-admin-action--edit");
        edit.addEventListener("click", function() {
            editDocumentName(parent, documentItem);
        });

        const remove = createIconButton("Borrar registro", "trash", "trans-admin-action--delete");
        remove.addEventListener("click", function() {
            deleteDocumentWithConfirm(parent, documentItem);
        });

        actions.appendChild(edit);
        actions.appendChild(remove);
        return actions;
    }

    function createIconButton(label, icon, extraClass) {
        const button = document.createElement("button");
        const iconElement = document.createElement("i");

        button.type = "button";
        button.className = "trans-admin-action " + (extraClass || "");
        button.title = label;
        button.setAttribute("aria-label", label);

        if (icon === "edit") {
            iconElement.className = "bx bx-edit-alt";
        }

        if (icon === "trash") {
            iconElement.className = "bx bx-trash";
        }

        if (icon === "plus") {
            iconElement.className = "bx bx-plus";
        }

        button.appendChild(iconElement);
        return button;
    }

    function createHeaderFromPrompt() {
        const title = cleanText(prompt("NOMBRE DEL ENCABEZADO"));

        if (!title) {
            return;
        }

        if (findTopNodeByTitle(title)) {
            alert("YA EXISTE UN ENCABEZADO CON ESE NOMBRE");
            return;
        }

        createTopNode(title);
        saveData();
        rerender();
    }

    function createSublevelFromPrompt(parent) {
        const title = cleanText(prompt("NOMBRE DEL SUBNIVEL"));

        if (!title) {
            return;
        }

        if (findDirectChildByTitle(parent, title)) {
            alert("YA EXISTE UN SUBNIVEL CON ESE NOMBRE");
            return;
        }

        createChildNode(parent, title);
        saveData();
        rerender();
    }

    function createRecordFromPrompt(parent) {
        const title = cleanText(prompt("NOMBRE DEL REGISTRO"));

        if (!title) {
            return;
        }

        const href = cleanPath(prompt("RUTA DEL PDF (OPCIONAL)", ""));

        parent.documents.push({
            id: createId(),
            title: title,
            href: href
        });

        if (href) {
            addPdf(title, href);
        }

        saveData();
        rerender();
    }

    function editNodeName(node, type) {
        const title = cleanText(prompt("NUEVO NOMBRE DEL " + type.toUpperCase(), node.title));

        if (!title) {
            return;
        }

        node.title = title;
        saveData();
        rerender();
    }

    function deleteNodeWithConfirm(node, type) {
        const message = type === "encabezado"
            ? "BORRAR EL ENCABEZADO " + node.title + "? SE BORRARAN SUS SUBNIVELES Y REGISTROS."
            : "BORRAR EL SUBNIVEL " + node.title + "? SE BORRARAN SUS REGISTROS.";

        if (!confirm(message + " NO SE BORRAN LOS PDF.")) {
            return;
        }

        removeNode(node.id, data.nodes);
        saveData();
        rerender();
    }

    function editDocumentName(parent, documentItem) {
        const title = cleanText(prompt("NUEVO NOMBRE DEL REGISTRO", documentItem.title));

        if (!parent || !title) {
            return;
        }

        documentItem.title = title;
        saveData();
        rerender();
    }

    function deleteDocumentWithConfirm(parent, documentItem) {
        if (!confirm("BORRAR EL REGISTRO " + documentItem.title + "? NO SE BORRA EL PDF.")) {
            return;
        }

        parent.documents = parent.documents.filter(function(item) {
            return item.id !== documentItem.id;
        });

        saveData();
        rerender();
    }

    function rerender() {
        render(document.querySelector(".articulo .articulo2 .info"));
    }

    function createFormTitle(text) {
        const form = document.createElement("form");
        const title = document.createElement("h4");
        title.textContent = text;
        form.appendChild(title);
        return form;
    }

    function createLabel(text) {
        const label = document.createElement("p");
        label.textContent = text;
        return label;
    }

    function createInput(labelText) {
        return {
            label: createLabel(labelText),
            input: document.createElement("input")
        };
    }

    function createSubmit(text) {
        const button = document.createElement("button");
        button.type = "submit";
        button.textContent = text;
        return button;
    }

    function createNodeSelect(includeRoot) {
        const select = document.createElement("select");

        if (includeRoot) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "NIVEL PRINCIPAL";
            select.appendChild(option);
        }

        flattenNodes(data.nodes).forEach(function(item) {
            const option = document.createElement("option");
            option.value = item.node.id;
            option.textContent = repeatText("-- ", item.depth) + item.node.title;
            select.appendChild(option);
        });

        return select;
    }

    function createHeaderChoiceSelect() {
        const select = document.createElement("select");

        data.nodes.forEach(function(node) {
            const option = document.createElement("option");
            option.value = node.id;
            option.textContent = node.title;
            select.appendChild(option);
        });

        const newOption = document.createElement("option");
        newOption.value = "__nuevo__";
        newOption.textContent = "NUEVO ENCABEZADO";
        select.appendChild(newOption);

        if (!data.nodes.length) {
            select.value = "__nuevo__";
        }

        return select;
    }

    function createHeaderSelect() {
        const select = document.createElement("select");

        data.nodes.forEach(function(node) {
            const option = document.createElement("option");
            option.value = node.id;
            option.textContent = node.title;
            select.appendChild(option);
        });

        return select;
    }

    function createSublevelSelect() {
        const select = document.createElement("select");

        flattenNodes(data.nodes).forEach(function(item) {
            if (item.depth === 0) {
                return;
            }

            const option = document.createElement("option");
            option.value = item.node.id;
            option.textContent = repeatText("-- ", item.depth - 1) + item.node.title;
            select.appendChild(option);
        });

        return select;
    }

    function createDocumentSelect() {
        const select = document.createElement("select");
        flattenDocuments(data.nodes).forEach(function(item) {
            const option = document.createElement("option");
            option.value = item.parent.id + "|" + item.document.id;
            option.textContent = item.document.title;
            select.appendChild(option);
        });
        return select;
    }

    function createPdfSelect() {
        const select = document.createElement("select");
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "SIN PDF";
        select.appendChild(empty);

        pdfs.forEach(function(pdf) {
            const option = document.createElement("option");
            option.value = pdf.href;
            option.textContent = pdf.title;
            select.appendChild(option);
        });

        return select;
    }

    function buildDatalist(id, nodes) {
        const datalist = document.createElement("datalist");
        datalist.id = id;

        nodes.forEach(function(node) {
            const option = document.createElement("option");
            option.value = node.title;
            datalist.appendChild(option);
        });

        return datalist;
    }

    function getAllSublevels() {
        const map = {};

        data.nodes.forEach(function(node) {
            node.children.forEach(function(child) {
                map[normalizeForCompare(child.title)] = child;
            });
        });

        return Object.keys(map).map(function(key) {
            return map[key];
        });
    }

    function findTopNodeByTitle(title) {
        const key = normalizeForCompare(title);

        return data.nodes.find(function(node) {
            return normalizeForCompare(node.title) === key;
        }) || null;
    }

    function createTopNode(title) {
        const node = createNode(title);
        data.nodes.push(node);
        return node;
    }

    function findDirectChildByTitle(parent, title) {
        const key = normalizeForCompare(title);

        return parent.children.find(function(node) {
            return normalizeForCompare(node.title) === key;
        }) || null;
    }

    function createChildNode(parent, title) {
        const node = createNode(title);
        parent.children.push(node);
        return node;
    }

    function flattenNodes(nodes, depth) {
        const currentDepth = depth || 0;

        return nodes.reduce(function(list, node) {
            list.push({ node: node, depth: currentDepth });
            return list.concat(flattenNodes(node.children, currentDepth + 1));
        }, []);
    }

    function flattenDocuments(nodes) {
        return nodes.reduce(function(list, node) {
            node.documents.forEach(function(documentItem) {
                list.push({
                    parent: node,
                    document: documentItem
                });
            });

            return list.concat(flattenDocuments(node.children));
        }, []);
    }

    function findDocumentBySelectValue(value) {
        const parts = String(value || "").split("|");
        const parent = findNode(parts[0]);

        if (!parent) {
            return null;
        }

        const documentItem = parent.documents.find(function(item) {
            return item.id === parts[1];
        });

        if (!documentItem) {
            return null;
        }

        return {
            parent: parent,
            document: documentItem
        };
    }

    function findNode(id, nodes) {
        const list = nodes || data.nodes;

        for (let index = 0; index < list.length; index += 1) {
            if (list[index].id === id) {
                return list[index];
            }

            const found = findNode(id, list[index].children);

            if (found) {
                return found;
            }
        }

        return null;
    }

    function removeNode(id, nodes) {
        for (let index = 0; index < nodes.length; index += 1) {
            if (nodes[index].id === id) {
                nodes.splice(index, 1);
                return true;
            }

            if (removeNode(id, nodes[index].children)) {
                return true;
            }
        }

        return false;
    }

    function collectPdfs(nodes) {
        return nodes.reduce(function(list, node) {
            node.documents.forEach(function(documentItem) {
                if (documentItem.href) {
                    list.push({
                        title: documentItem.title,
                        href: documentItem.href
                    });
                }
            });

            return list.concat(collectPdfs(node.children));
        }, []);
    }

    function addPdf(title, href) {
        const cleanHref = cleanPath(href);

        if (!cleanHref) {
            return;
        }

        const cleanTitle = cleanText(title) || getFileName(cleanHref) || cleanHref;
        const existing = pdfs.find(function(pdf) {
            return pdf.href.toLowerCase() === cleanHref.toLowerCase();
        });

        if (existing) {
            existing.title = cleanTitle;
        } else {
            pdfs.push({
                title: cleanTitle,
                href: cleanHref
            });
        }

        pdfs = mergePdfs(pdfs);
        savePdfs();
    }

    function mergePdfs() {
        const map = {};

        Array.prototype.slice.call(arguments).forEach(function(list) {
            (list || []).forEach(function(pdf) {
                const href = cleanPath(pdf.href || "");

                if (!href) {
                    return;
                }

                map[href.toLowerCase()] = {
                    title: cleanText(pdf.title) || getFileName(href) || href,
                    href: href
                };
            });
        });

        return Object.keys(map).map(function(key) {
            return map[key];
        }).sort(function(a, b) {
            return a.title.localeCompare(b.title);
        });
    }

    function createNode(title) {
        return {
            id: createId(),
            title: title,
            children: [],
            documents: []
        };
    }

    function ensureGeneral(nodes) {
        let general = nodes.find(function(node) {
            return node.title === "GENERAL";
        });

        if (!general) {
            general = createNode("GENERAL");
            nodes.push(general);
        }

        return general;
    }

    function saveData() {
        localStorage.setItem(DATA_KEY, JSON.stringify(data));
        savePdfs();
    }

    function savePdfs() {
        localStorage.setItem(PDF_KEY, JSON.stringify(pdfs));
    }

    function loadJson(key) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            return null;
        }
    }

    function cleanText(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function normalizeForCompare(value) {
        return cleanText(value).toLowerCase();
    }

    function cleanPath(value) {
        return String(value || "").replace(/\\/g, "/").trim();
    }

    function getFileName(path) {
        const parts = cleanPath(path).split("/");
        return (parts[parts.length - 1] || "").replace(/\.[^.]+$/, "");
    }

    function repeatText(text, times) {
        let result = "";

        for (let index = 0; index < times; index += 1) {
            result += text;
        }

        return result;
    }

    function createId() {
        return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTransparenciaAdmin);
    } else {
        initTransparenciaAdmin();
    }
})();
