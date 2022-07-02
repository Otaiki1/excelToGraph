const excelJson = document.getElementById("json-result");
const graphObjectLabels = {};
const graphObjectData = {}
let graphData = []
const displayer  = document.getElementById("displayer")
const svgOutput = document.getElementById("mySvg")
const strip = document.getElementById('strip')
//Method to upload an excel file
async function upload(){
    const file = document.getElementById('file_upload').files
    if(file.length == 0){
        alert("No Files Selected");
        return;
    }
    const filename = file[0].name;
    const extension = filename.substring(filename.lastIndexOf(".")).toUpperCase();
    if(extension == ".XLS" || extension == ".XLSX"){
        await excelFileToJSON(file[0])
    }else{
        alert("please select a valid Excel File")
    }

}
// Method to convert excelFileToJSON
function excelFileToJSON(file){
    try{
        const reader = new FileReader();
        reader.readAsBinaryString(file)
        reader.onload = (e) =>{
            let data = e.target.result;
            let workbook = XLSX.read(data, {
                type: "binary"
            });
            let result = {};
            workbook.SheetNames.forEach(sheetName =>{
                let roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if(roa.length > 0){
                   result[sheetName] = roa;
                }
            })
            //displaying the JSON result
            const outputJson = result.Sheet1
            outputJson.forEach(
              elem =>{
                let storeKeys = Object.keys(elem)
                graphData.push({name: elem[storeKeys[0]], amount: elem[storeKeys[1]]})
                graphObjectLabels[elem[storeKeys[0]]] = elem[storeKeys[0]]
                graphObjectData[elem[storeKeys[1]]] = elem[storeKeys[1]]
              }
            )
            const resultEle = document.getElementById('json-result');
            resultEle.innerText = JSON.stringify(result, null, 4);
            console.log(graphData)

    }
    }catch(e){
        console.error(e)
    }
    
}
function generateGraph(){
  const data = graphData;

  const width = 1500;
  const height = 600;
  const margin = {top: 50, bottom: 50, left: 50, right: 50}

  const svg = d3.select('#mySvg')
                .attr('height', height - margin.top - margin.bottom)
                .attr('width', width - margin.left - margin.right)
                .attr('viewBox', [0,0,width, height])
      
  const x = d3.scaleBand()
              .domain(d3.range(graphData.length))
              .range([margin.left, width - margin.right])
              .padding(0.1)

  const y = d3.scaleLinear()
              .domain([0, 100])
              .range([height - margin.bottom, margin.top])

  svg.append('g')
     .attr('fill', 'royalblue')
     .selectAll('rect')
     .data(data)
     .join("rect")
        .attr("x", (d, i) => x(i))
        .attr("y", d => y(d.amount))
        .attr('title', (d) => d.amount)
        .attr("class", "rect")
        .attr("height", (d) => y(0) - y(d.amount))
        .attr("width", x.bandwidth())
        .attr("data-text",(d) => [d.name, d.amount])
 
 function yAxis(g) {
   g.attr("transform", `translate(${margin.left}, 0)`)
     .call(d3.axisLeft(y).ticks(null, data.format))
     .attr("font-size", '20px')
 }
 
 function xAxis(g) {
   g.attr("transform", `translate(0,${height - margin.bottom})`)
     .call(d3.axisBottom(x).tickFormat(i => data[i].name))
     .attr("font-size", '10px')
 }
 
 svg.append("g").call(xAxis);
 svg.append("g").call(yAxis);
 svg.node();


 

  // const labels = []
  // const graphData = []
  // console.log(graphData)
  // for(let i in graphObjectData){
  //   graphData.push(graphObjectData[i])
  // }
  // for(let i in graphObjectLabels){
  //   labels.push(graphObjectLabels[i])
  // }
  
  // var barColors = ["red", "green","blue","orange","brown"];

  // const CHART = document.getElementById('myChart');
  // Chart.defaults.scale.ticks.beginAtZero = true;
  // let barChart  = new Chart(CHART, {
  //   type : "line",
  //   data: {
  //     labels: labels,
  //     datasets: [
  //       {
  //         data: graphData
  //     }
  //   ]
  //   }
  // })
  document.querySelectorAll('.rect').forEach(
    elem => {
      let info  = elem.dataset.text.split(",")
      elem.addEventListener('click', ()=>{ 
        console.log(elem)
        displayer.innerText = `This is ${info[0]} and its value is ${info[1]}`})
      elem.addEventListener('mouseenter', ()=> displayer.innerText = `This is ${info[0]} and its value is ${info[1]}`)
    }
  )
}

function downloadSvg(){
  let{width, height} = svgOutput.getBBox();
  let clonedSvgElement = svgOutput.cloneNode(true)
  //true for deep clone
  let outerHTML = clonedSvgElement.outerHTML,
      blob = new Blob([outerHTML], {type:'image/svg+xml;charset=utf-8'})

      let URL = window.URL;
      let blobURL = URL.createObjectURL(blob)
      console.log(blobURL)
      let image = new Image();

      image.onload = () => {
        let canvas = document.createElement('canvas')
        canvas.width = width;
        canvas.height = height;

        let context = canvas.getContext('2d');
        //Draw image in canvas starting from the left at 0 and the top 0
        context.drawImage(image, 0, 0, width, height)
        downloadImage(canvas)
      };
      image.src = blobURL
  
  //now for the main stuff
  
}
function downloadImage(canvas){
  const data = canvas.toDataURL()
  download(data, "image.png");
}
let download = function(href, name){
  var link = document.createElement('a');
  link.download = name;
  link.style.opacity = "0";
  strip.append(link);
  link.href = href;
  link.click();
  link.remove();
}
download(png, "image.png");