const baseURL = "https://citybee-server-6d83x.ondigitalocean.app";

const hideMsgBtn = document.querySelector(".notification > button.delete");
hideMsgBtn.addEventListener("click", (event) => {
    event.target.parentNode.style.display ="none";
});

const catchError = (error) => {
    document.querySelectorAll("table").forEach((element) => (element.style.display = "none"));
    const errorMessage = document.querySelector(".notification > .msg");
    errorMessage.textContent = error;
    errorMessage.parentNode.style.display ="block";
};

const showMsg = (msg) => {
    const msgEl = document.querySelector(".notification > .msg");
    msgEl.textContent = msg;
    msgEl.parentNode.style.display ="block";
};

let page = window.location.href.split("/");
page = page[page.length-1];

if (page == "index.html") {

    fetch(baseURL + "/models")
    .then((res) => res.json())
    .then((data) => {
        if (data && data.length > 0) {
            data.forEach((item) => {
                const tr = document.querySelector("#models > tbody").insertRow();
                const td1 = tr.insertCell();
                td1.textContent = item.name;
                const td2 = tr.insertCell();
                td2.textContent = item.hour_price;
            })
        } else {
        catchError("No data has been retrieved");
        }
    }) 
    .catch(err => {
        catchError(err);
    }); 

    fetch(baseURL + "/modelscount")
    .then((res) => res.json())
    .then((data) => {
        if (data && data.length > 0) {
            data.forEach((item) => {
                const tr = document.querySelector("#modelscount > tbody").insertRow();
                const td1 = tr.insertCell();
                td1.textContent = item.name;
                const td2 = tr.insertCell();
                td2.textContent = item.amount;
                const td3 = tr.insertCell();
                td3.textContent = item.hour_price;
            })
        } else {
        catchError("No data has been retrieved");
        }
    }) 
    .catch(err => {
        catchError(err);
    }); 
}

else if (page == "view-vehicles.html") {
    
    const fetchVehicles = (countryLocation) => {
        const url = baseURL + "/vehicles" + (countryLocation ? "/" + countryLocation : "");
        fetch(url)
        .then((res) => res.json())
        .then((data) => {
            if (data && data.length > 0) {
                data.sort((a, b) => (a.name < b.name ? -1 : 1));
                const tbody = document.querySelector("#vehicles > tbody");
                tbody.innerHTML = "";
                data.forEach((item) => {
                    const tr = tbody.insertRow();
                    const td1 = tr.insertCell();
                    td1.textContent = item.name;
                    const td2 = tr.insertCell();
                    const hour_price = item.country_location == "EE" ? (item.hour_price * 1.2).toFixed(2) : (item.hour_price * 1.21).toFixed(2);
                    td2.textContent = hour_price;
                    const td3 = tr.insertCell();
                    td3.textContent = item.number_plate;
                    const td4 = tr.insertCell();
                    td4.textContent = item.country_location;
                })
            } else {
            catchError("No data has been retrieved");
            }
        }) 
        .catch(err => {
            catchError(err);
        });
    };

    fetchVehicles(); 

    const btnAll = document.querySelector("#btn-all");
    const btnLT = document.querySelector("#btn-lt");
    const btnLV = document.querySelector("#btn-lv");
    const btnEE = document.querySelector("#btn-ee");

    btnAll.addEventListener("click", (event) => {fetchVehicles();});
    btnLT.addEventListener("click", (event) => {fetchVehicles("LT");});
    btnLV.addEventListener("click", (event) => {fetchVehicles("LV");});
    btnEE.addEventListener("click", (event) => {fetchVehicles("EE");});
}

else if (page == "add-model.html") {
    
    const sendModel = async (name, hour_price) => {
        try {
            const res = await fetch(`${baseURL}/models`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({name, hour_price}),
            });
            const data = await res.json();
            if (data.id) {
                showMsg("Model added successfuly.")
            }
        } catch (err) {
            catchError(err);
        }
    }
    
    document.forms.add_model.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.forms.add_model.model_name.value;
        const hour_price = document.forms.add_model.hour_price.value;
        if (!name || !hour_price) {
            catchError("Incomplete data submitted."); 
            return;
        }
        sendModel(name, hour_price);
    });

}

else if (page == "add-vehicle.html") {

    fetch(baseURL + "/models")
    .then((res) => res.json())
    .then((data) => {
        if (data && data.length > 0) {
            data.sort((a, b) => (a.name < b.name ? -1 : 1));
            const selectbox = document.querySelector('select[name="models"]');
            data.forEach((item) => {
                const option = document.createElement("option");   
                option.textContent = item.name;
                option.value = item.id;
                selectbox.append(option);
            })
        } else {
            catchError("Model data has not been retrieved");
        }
    }) 
    .catch(err => {
        catchError(err);
    });

    const sendVehicle = async (model_id, country_location, number_plate) => {
        try {
            const res = await fetch(`${baseURL}/vehicles`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({model_id, country_location, number_plate}),
            });
            const data = await res.json();
            if (data.id) {
                showMsg("Vehicle added successfuly.")
                document.forms.add_vehicle.models.selectedIndex = 0; 
                document.forms.add_vehicle.country_location.selectedIndex = 0; 
                document.forms.add_vehicle.number_plate.value = "";
            }
        } catch (err) {
            catchError(err);
        }
    }

    document.forms.add_vehicle.addEventListener("submit", (e) => {
        e.preventDefault();
        const model_id = document.forms.add_vehicle.models.value;
        const country_location = document.forms.add_vehicle.country_location.value;
        const number_plate = document.forms.add_vehicle.number_plate.value;
        if (!model_id || !country_location || !number_plate) {
            catchError("Incomplete data submitted."); 
            return;
        }
        sendVehicle(model_id, country_location, number_plate);
    });

}