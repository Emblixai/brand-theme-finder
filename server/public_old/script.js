async function scanWebsite() {

    const url = document.getElementById("website").value;

    document.getElementById("result").innerHTML = "Scanning Website...";

    const response = await fetch("/api/scan", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            url
        })

    });

    const data = await response.json();

    let html = `<h2>${data.title}</h2>`;

    // Logo
    if (data.logo) {

        if (data.logo.startsWith("<svg")) {

            html += `<div style="margin:20px 0">${data.logo}</div>`;

        } else {

            html += `
            <img
            src="${data.logo}"
            style="max-width:220px;margin:20px 0;">
            `;

        }

    }

    // Logo Colors
    html += `<h3>Logo Colors</h3>`;

    if (data.logoColors.length === 0) {

        html += "<p>No SVG colors found.</p>";

    } else {

        data.logoColors.forEach(color => {

            html += `

            <div style="
                display:flex;
                align-items:center;
                margin-bottom:10px;
            ">

                <div style="
                    width:40px;
                    height:40px;
                    background:${color};
                    border:1px solid #ccc;
                    margin-right:15px;
                "></div>

                <strong>${color}</strong>

            </div>

            `;

        });

    }

    document.getElementById("result").innerHTML = html;

}