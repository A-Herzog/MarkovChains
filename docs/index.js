/*
Copyright 2024 Alexander Herzog

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {selectLanguage} from './js/LanguageTools.js';
import {initApp, changeSettings, changeMatrixValue, updateSize} from './js/Main.js';
import {loadSearchStringParameters} from "./js/StringTools.js";
import {getInt} from "./js/NumberTools.js";

/**
 * Writes data to a table.
 * @param {String} id Id ("Discrete" or "Continuous") of the table
 * @param {Number} size Size of the matrix
 * @param {Array} matrix Matrix data
 */
function writeMatrixData(id, size, matrix) {
  for (let i=0;i<size;i++) for (let j=0;j<size;j++) {
    if (matrix.length<=i || matrix[i].length<=j) continue;
    const td=document.getElementById(id+"-"+(i+1)+"-"+(j+1));
    if (td!=null) td.innerHTML=matrix[i][j];
  }
  changeMatrixValue(id);
}

/**
 * Starts the Web-App.
 */
function start() {
  /* Select language */
  if (selectLanguage([{name: "default", file: "index.html"}, {name: "de", file: "index_de.html"}])) return;

  /* Select color mode */
  let selectedColorMode=localStorage.getItem('selectedColorMode');
  if (selectedColorMode==null) selectedColorMode=(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)?"dark":"light";
  document.documentElement.dataset.bsTheme=selectedColorMode;

  /* Init app */
  initApp();
  const resizeObserver1=new ResizeObserver(()=>updateSize("Discrete"));
  resizeObserver1.observe(boxGraphDiscrete.parentElement);
  const resizeObserver2=new ResizeObserver(()=>updateSize("Continuous"));
  resizeObserver2.observe(boxGraphContinuous.parentElement);

  /* More tools & download buttons */
  simButton.onclick=()=>{
    const file="mg1sim"+((document.documentElement.lang=='de')?"_de":"")+".html";
    window.open(file,"_blank");
  };

  /* Process permalink parameters */
  const validKeys=["mode","size","matrix","start"];
  const data=loadSearchStringParameters(validKeys);
  if (typeof(data.mode)=='string') {
    const mode=getInt(data.mode);
    if (mode===0 || mode===1) {
      modeSelect.value=mode;
      changeSettings();
    }
  }
  if (typeof(data.size)=='string') {
    const size=getInt(data.size);
    if (size>=2 && size<=6) {
      const mode=parseInt(modeSelect.value);
      if (mode==0) numberOfStatesDiscrete.value=size; else numberOfStatesContinuous.value=size;
      changeSettings();
    }
  }
  if (typeof(data.matrix)=='string') {
    const rows=data.matrix.split(";;");
    const matrix=rows.map(row=>row.split(";"));
    const mode=parseInt(modeSelect.value);
    if (mode==0) writeMatrixData("Discrete",parseInt(numberOfStatesDiscrete.value),matrix); else writeMatrixData("Continuous",parseInt(numberOfStatesContinuous.value),matrix);
  }
  if (typeof(data.start)=='string') {
    const mode=parseInt(modeSelect.value);
    const size=parseInt((mode===0)?numberOfStatesDiscrete.value:numberOfStatesContinuous.value);
    const start=parseInt(data.start);
    if (start>=1 && start<=size) {
      if (mode===0) {
        simulationStartSelectDiscrete.value=start;
        changeMatrixValue("Discrete");
      } else {
        simulationStartSelectContinuous.value=start;
        changeMatrixValue("Continuous");
      }
    }
  }
}

start();
