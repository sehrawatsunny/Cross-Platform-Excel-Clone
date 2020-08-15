const $ = require("jquery");
const fs = require("fs");
const dialog = require("electron").remote.dialog;
$(document).ready(
    function () {
        let db;
        let lsc;
        // ***************Formatting and functionality
        $(".menu >*").on("click", function () {
            let id = $(this).attr("id");
            $(".menu-options-item").removeClass("selected");
            $(`#${id}-menu-options`).addClass("selected");
        })

        $("#grid .cell").on("click", function () {
            // let cCell=this
            let ri = Number($(this).attr("ri"));
            let ci = Number($(this).attr("ci"));
            let Address = String.fromCharCode(65 + ci) + (ri + 1);
            let cellObject = getCellObject(ri, ci);
            $("#address-input").val(Address);
            $("#formula-input").val(cellObject.formula);
            
            $(this).addClass("selected");
            if (lsc && lsc != this)
                $(lsc).removeClass("selected");
            lsc = this;
            if (cellObject.bold) {
                $('#bold').addClass('selected');
            } else {
                $('#bold').removeClass('selected');
            }

            if (cellObject.underline) {
                $('#underline').addClass('selected');
            } else {
                $('#underline').removeClass('selected');
            }

            if (cellObject.italic) {
                $('#italic').addClass('selected');
            } else {
                $('#italic').removeClass('selected');
            }
            // $('#bg-color').val(cellObject.bgColor);
            // $('#text-color').val(cellObject.textColor);
            // $('[halign]').removeClass('selected');
            // $('[halign=' + cellObject.halign + ']').addClass('selected');
        })


        $('#font-family').on("change", function () {
            let fontFamily = $(this).val();

            let cell = $("#grid .cell.selected")
            $(cell).css("font-family", fontFamily);

            let rid = parseInt($(cell).attr('ri'));
            let cid = parseInt($(cell).attr('ci'));

            db[rid][cid].fontFamily = fontFamily;
        })
    

$('#font-size').on("change", function () {
    let fontSize = $(this).val();

    let cell = $("#grid .cell.selected");

    $(cell).css("font-size", fontSize + 'px');

    let rid = parseInt($(cell).attr('ri'));
    let cid = parseInt($(cell).attr('ci'));

    db[rid][cid].fontSize = fontSize;

})
$('#bold').on("click", function () {
    $(this).toggleClass('selected');
    let bold = $(this).hasClass('selected');
    let cell = $("#grid .cell.selected")
    $(cell).css("font-weight", bold ? "bolder" : "normal");

    let rid = parseInt($(cell).attr('ri'));
    let cid = parseInt($(cell).attr('ci'));

    db[rid][cid].bold = bold;
})

$('#underline').on("click", function () {
    $(this).toggleClass('selected');
    let underline = $(this).hasClass('selected');

    let cell = $("#grid .cell.selected")
    $(cell).css("text-decoration", underline ? "underline" : "none");

    let rid = parseInt($(cell).attr('ri'));
    let cid = parseInt($(cell).attr('ci'));

    db[rid][cid].underline = underline;

})

$('#italic').on("click", function () {
    $(this).toggleClass('selected');
    let italic = $(this).hasClass('selected');

    let cell = $("#grid .cell.selected")
    $(cell).css("font-style", italic ? "italic" : "normal");

    let rid = parseInt($(cell).attr('ri'));
    let cid = parseInt($(cell).attr('ci'));

    db[rid][cid].italic = italic;
})


$('#bg-color').on("change", function () {
    let bgColor = $(this).val();

    $("#grid .cell.selected").each(function () {
        $(this).css("background-color", bgColor);

        let rid = parseInt($(this).attr('ri'));
        let cid = parseInt($(this).attr('ci'));

        rows[rid][cid].bgColor = bgColor;
        $(this).trigger('keyup');
    })
})

$('#text-color').on("change", function () {
    let textColor = $(this).val();

    $("#grid .cell.selected").each(function () {
        $(this).css("color", textColor);

        let rid = parseInt($(this).attr('ri'));
        let cid = parseInt($(this).attr('ci'));

        rows[rid][cid].textColor = textColor;
        $(this).trigger('keyup');
    })
})

$('[halign]').on('click', function () {
    $('[halign]').removeClass('selected');
    $(this).addClass('selected');

    let halign = $(this).attr('halign');

    $("#grid .cell.selected").each(function () {
        $(this).css("text-align", halign);

        let rid = parseInt($(this).attr('ri'));
        let cid = parseInt($(this).attr('ci'));

        rows[rid][cid].halign = halign;
        $(this).trigger('keyup');
    })
})
// **************************New Open Save*********************
// Ne click=> Ui and DB 

$("#New").on("click", function () {
    db = [];
    let rows = $("#grid").find(".row");
    for (let i = 0; i < rows.length; i++) {
        let cells = $(rows[i]).find(".cell");
        let row = [];
        for (let j = 0; j < cells.length; j++)
         {

            let cell = {
                value: "",
                formula: "",
                downstream: [],
                upstream: [],
                fontFamily: 'Arial',
                fontSize: 12,
                bold: false,
                underline: false,
                italic: false,
                bgColor: '#FFFFFF',
                textColor: '#000000',
                halign: 'left'
            }
            $(cells[j]).html("");
            $(cells[j]).html(cell.value);
            $(cells[j]).css('font-family', cell.fontFamily);
            $(cells[j]).css("font-size", cell.fontSize + 'px');
            $(cells[j]).css("font-weight", cell.bold ? "bolder" : "normal");
            $(cells[j]).css("text-decoration", cell.underline ? "underline" : "none");
            $(cells[j]).css("font-style", cell.italic ? "italic" : "normal");
            $(cells[j]).css("background-color", cell.bgColor);
            $(cells[j]).css("color", cell.textColor);
            $(cells[j]).css("text-align", cell.halign);
            row.push(cell);
        }
        db.push(row);
    }
    console.log(db);
    $($("#grid .cell")[0]).trigger("click");
})
$("#Save").on("click", async function () {
    // first time save / file name =? create => data save 
    // 
    let sdb = await dialog.showOpenDialog();
    let jsonData = JSON.stringify(db);
    fs.writeFileSync(sdb.filePaths[0], jsonData);
    console.log("File Saved")
})
$("#Open").on("click", async function () {
    let sdb = await dialog.showOpenDialog();
    let buffContent = fs.readFileSync(sdb.filePaths[0]);
    db = JSON.parse(buffContent);

    let rows = $("#grid").find(".row");
    for (let i = 0; i < rows.length; i++) {
        let cells = $(rows[i]).find(".cell");

        for (let j = 0; j < cells.length; j++) {
            let cell = db[i][j]
            $(cells[j]).html("");
            $(cells[j]).html(cell.value);
            $(cells[j]).css('font-family', cell.fontFamily);
            $(cells[j]).css("font-size", cell.fontSize + 'px');
            $(cells[j]).css("font-weight", cell.bold ? "bolder" : "normal");
            $(cells[j]).css("text-decoration", cell.underline ? "underline" : "none");
            $(cells[j]).css("font-style", cell.italic ? "italic" : "normal");
            $(cells[j]).css("background-color", cell.bgColor);
            $(cells[j]).css("color", cell.textColor);
            $(cells[j]).css("text-align", cell.halign);
        }
    }
    console.log("File Opened");
})
// Update

// *************************Formula*******************************
// => when you enter anything you should put an entry inside db 
$("#grid .cell").on("blur", function () {
    let ri = Number($(this).attr("ri"));
    let ci = Number($(this).attr("ci"));
    let cellObject = getCellObject(ri, ci);

    //if we havent update the value on current cell,that is 
    //the html value present there and the object value is same,so return.
    if ($(this).html() == cellObject.value) {
        return;
    }
   //if agar current cell par forumala pda tha and now we are updating some value on current cell,so call
   //removeFormula() first. 
    if (cellObject.formula) {
        removeFormula(cellObject, ri, ci);
    }

    // console.log(ri + " " + ci)
    // db[ri][ci].value = $(this).html();
    updateCell(ri, ci, $(this).html())
    // console.log(db);
})
$("#formula-input").on("blur", function () {
    let cellAddress = $("#address-input").val();
    let { rowId, colId } = getRcFAddr(cellAddress);
    let cellObject = getCellObject(rowId, colId);
    // set formula property
    //implement this function to detect cycle.
    //and pass current value of formula and cellObject.
    // isFormulaValid($(this).html(), cellObject)

    //if previous formula is same as current formula simply return.
    //$(this).val() current object ke html mei jo value padi hai.
    if (cellObject.formula == $(this).val()) {
        return;
    }
    //agar current cell address par koi formula pehle se pda hai toh usko remove krdo.
    if (cellObject.formula) {
        removeFormula(cellObject, rowId, colId)
    }
    //assign new formula here
    cellObject.formula = $(this).val();
    // evaluate formula
    let rVal = evaluate(cellObject);
    //Setup formula se current objct (address=celladress)  ko uske parent ke downstream wle array mei add krwado.
    setupFormula(rowId, colId, cellObject.formula);
    //update the html of this current cell and also update the values of the cell which are present in its downstream array.
    updateCell(rowId, colId, rVal);
})
function evaluate(cellObject) {
    // ( A1 + A2 )
    let formula = cellObject.formula;
    console.log(formula);
    let formulaComponent = formula.split(" ");
    // ["(","A1",+,"A2",")"]
    for (let i = 0; i < formulaComponent.length; i++) {
        let code = formulaComponent[i].charCodeAt(0);
        // if cell
        if (code >= 65 && code <= 90) {
            let parent = getRcFAddr(formulaComponent[i]);
            let parentObj = db[parent.rowId][parent.colId];
            let value = parentObj.value;
            formula = formula.replace(formulaComponent[i], value);
        }
    }
    // (10 + 20 ) 
    console.log(formula);
    // infix evaluation
    let rVal = eval(formula);
    console.log(rVal);
    return rVal;

}
//jo bi rowId and colId ke corresponding object hai wo khud ko uodate krega
//then html ko update kro and then jo jo cur cell pr dependent thae unko update karo.
function updateCell(rowId, colId, rVal)
 {  //getCellObject returns the corresponding object to current rowId and cellId from db.
    let cellObject = getCellObject(rowId, colId);
    cellObject.value = rVal;//update the value.
    //Update the evaluated value on the UserInterface that is html file.
    $(`#grid .cell[ri=${rowId}][ci=${colId}]`).html(rVal);

    for (let i = 0; i < cellObject.downstream.length; i++) {
        //small downstream object row col =sdorc
        let sdsorc = cellObject.downstream[i];
        //sdorc stores an object which contains rowId and colId of the child.
        //full downstream object.
        let fdso = getCellObject(sdsorc.rowId, sdsorc.colId);
        let rVal = evaluate(fdso);
        updateCell(sdsorc.rowId, sdsorc.colId, rVal)
    }
}

function setupFormula(rowId, colId, formula) {
    // ( A1 + A2 )
    let cellObject = getCellObject(rowId, colId);
    let formulaComponent = formula.split(" ");
    // [(,A1,+A2,)]
    for (let i = 0; i < formulaComponent.length; i++) {
        let code = formulaComponent[i].charCodeAt(0);
        // if cell
        if (code >= 65 && code <= 90) {
            let parent = getRcFAddr(formulaComponent[i]);
            let parentObj = db[parent.rowId][parent.colId];

            parentObj.downstream.push({
                rowId: rowId, colId: colId
            })
            cellObject.upstream.push({
                rowId: parent.rowId,
                colId: parent.colId
            })
        }
    }
}

function removeFormula(cellObject, rowId, colId) {
    // delete yourself from parent's downstream
    for (let i = 0; i < cellObject.upstream.length; i++) {
        //small upstream object.
        let suso = cellObject.upstream[i];
        //full upstream object.
        let fuso = getCellObject(suso.rowId, suso.colId);
        let fupArr = []; //filter upstream array.
        for (let j = 0; j < fuso.downstream.length; j++) {
            let rc = fuso.downstream[j];
            if (!(rc.rowId == rowId && rc.colId == colId)) {
                fupArr.push(rc);
            }
        }
        fuso.downstream = fupArr;
    }
    // remove formula
    cellObject.formula = "";
    // clear upstream
    cellObject.upstream = [];

}
function getCellObject(rowId, colId) {
    return db[rowId][colId];
}
function getRcFAddr(cellAddress) {
    //let cellAddress =A2 ,so A is the colId and 2-1 is the rowId for row2.
    let colId = cellAddress.charCodeAt(0) - 65;
    let row = cellAddress.substring(1);
    let rowId = Number(row) - 1;
    return { colId, rowId };
}

function init() {
    $("#File").trigger("click");
    $("#New").trigger("click");
}
init()





    }


)