class Production {
    constructor(name) {
        this.name = name;
        this.cameras = [];
    }

    addCamera(camera, lens) {
        this.cameras.push(new Camera(camera, lens));
    }
}

class Camera {
    constructor(cameraType, lens) {
        this.cameraType = cameraType;
        this.lens = lens;
    }
}

class ProductionService {
    static url = 'https://61fda8f3a58a4e00173c9629.mockapi.io/api/v1production';
   
   
    static getProduction(id) {
        return $.get(this.url + `/${id}`);
    }
   
    static getAllProductions() {
        return $.get(this.url);
    }


    static createProduction(production){
        return $.ajax({
            url: this.url,
            dataType: 'json',
            data: JSON.stringify(production),
            contentType: 'application/json',
            type: 'POST'
        });
    }

    static updateProduction(production) {
        return $.ajax({
            url: this.url + `/${production.id}`,
            dataType: 'json',
            data: JSON.stringify(production),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteProduction(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static productions = [];

    static getAllProductions() {
        ProductionService.getAllProductions()
        .then((productions) => {
        this.render(productions)
        });
    }

    static createProduction(name) {
        ProductionService.createProduction(new Production(name))
        .then(() => {
            return ProductionService.getAllProductions();
        })
        .then((productions) => this.render(productions));
    }

    static deleteProduction(id) {
        ProductionService.deleteProduction(id)
            .then(() => {
                return ProductionService.getAllProductions();
            })
            .then((productions) => this.render(productions));
        }

    static addCamera(id){
        for(let production of this.productions){
            if(production.id == id){
                production.cameras.push(new Camera($(`#${production.id}-camera-name`).val(), $(`#${production.id}-camera-lens`).val()))
                ProductionService.updateProduction(production)
                .then(() => {
                    return ProductionService.getAllProductions();
                })
                .then((productions) => this.render(productions));
            }
        }
    }

    static deleteCamera(productionId, cameraId) {
        for (let production of this.productions) {
            if (production.id == productionId) {
                for (let camera of production.cameras) {
                    if (camera.cameraType == cameraId) {
                        production.cameras.splice(production.cameras.indexOf(camera), 1);
                        ProductionService.updateProduction(production)
                            .then(() => {
                            return ProductionService.getAllProductions();
                        })
                        .then((productions) => this.render(productions));
                    }
                }
            }
        }
    }

    static render(productions) {
        this.productions = productions;
        $('#app').empty();
        for (let production of productions) {
            $('#app').prepend(
                `<div id="${production.id}" class="card">
                    <div class="card-header">
                        <h2>${production.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteProduction('${production.id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${production.id}-camera-name" class="form-control" placeholder="Camera Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${production.id}-camera-lens" class="form-control" placeholder="Camera Lens">
                                </div>
                            </div>
                            <button id="${production.id}-new-camera" onclick="DOMManager.addCamera('${production.id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            for (let camera of production.cameras) {
                $(`#${production.id}`).find('.card-body').append(
                    `<p>
                    <span id="name-${camera.id}"><strong>Camera: </strong> ${camera.cameraType}</span>
                    <span id="lens-${camera.id}"><strong>Lens: </strong> ${camera.lens}</span>
                    <button class="btn btn-danger" onclick="DOMManager.deleteCamera('${production.id}', '${camera.cameraType}')">Delete Camera</button></p>`
                );
            }
        }
    }

}

$('#create-new-production').click(() => {
    DOMManager.createProduction($('#new-production-name').val());
    $('#new-production-name').val('');
});

DOMManager.getAllProductions();