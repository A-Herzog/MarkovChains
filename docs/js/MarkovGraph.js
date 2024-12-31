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

export {drawMarkovGraph, clearMarkovGraph}

import {formatNumber} from "./NumberTools.js";

/**
 * Global variable (in module) for canvas width
 */
let canvasWidth;

/**
 * Global variable (in module) for canvas height
 */
let canvasHeight;

/**
 * Draws a circle (a state) in the Markov graph.
 * @param {Object} ctx Canvas context
 * @param {Number} x Circle x position
 * @param {Number} y Circle y position
 * @param {Number} nr Value to be written in the circle
 * @param {Boolean} highlight Highlight the circle (red border)
 * @param {Number} intensity Intensity (background color)
 */
function drawCircle(ctx, x, y, nr, highlight, intensity) {
  ctx.strokeStyle=highlight?'red':'black';
  ctx.fillStyle='rgb(0,'+Math.round(255-intensity*115)+',79)';

  ctx.beginPath();
  ctx.arc(Math.round(canvasWidth*x),Math.round(canvasHeight*y),14,0,2*Math.PI,false);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle="black";
  ctx.font="bold 12px Arial";
  ctx.fillText(""+nr,Math.round(canvasWidth*x)-4,Math.round(canvasHeight*y)+4);
}

/**
 * Draws a connecting edge/arrow.
 * @param {Object} ctx Canvas context
 * @param {Number} x1 x coordinate of the start point
 * @param {Number} y1 y coordinate of the start point
 * @param {Number} x2 x coordinate of the end point
 * @param {Number} y2 y coordinate of the end point
 * @param {Number} p Transition rate to be written at the edge
 * @param {Boolean} mark Highlight the edge
 * @param {Boolean} arcUp Is the edge going upwards?
 */
function drawArrow(ctx, x1, y1, x2, y2, p, mark, arcUp) {
  const x3=x2-Math.round((x2-x1)/30);
  const y3=y2-Math.round((y2-y1)/30);
  /* 0=x*xd+y*yd, xd+yd=1 => yd=1-xd; 0=x*dx+y*(1-xd) => y=xd*(y-x) => xd=y/(y-x) */
  let xD,yD;
  if ((y2-y1)==(x2-x1)) {
    xD=0.5;
    yD=-0.5;
  } else {
    xD=(y2-y1)/((y2-y1)-(x2-x1));
    yD=1-xD;
  }

  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineTo(x3+Math.round(5*xD),y3+Math.round(5*yD));
  ctx.moveTo(x2,y2);
  ctx.lineTo(x3-Math.round(5*xD),y3-Math.round(5*yD));

  ctx.strokeStyle=mark?"red":"black";
  ctx.stroke();

  ctx.fillStyle=mark?"red":"black";
  ctx.font="10px Arial";
  if (arcUp) {
    ctx.fillText(formatNumber(p),x2-Math.round((x2-x1)/5)-Math.round(10*xD),y2-Math.round((y2-y1)/5)-Math.round(10*yD));
  } else {
    ctx.fillText(formatNumber(p),x2-Math.round((x2-x1)/5)+Math.round(10*xD),y2-Math.round((y2-y1)/5)+Math.round(10*yD));
  }
}

/**
 * Draws a two-way connection between two states.
 * @param {Object} ctx Canvas context
 * @param {Number} x1 x coordinate of the start point
 * @param {Number} y1 y coordinate of the start point
 * @param {Number} x2 x coordinate of the end point
 * @param {Number} y2 y coordinate of the end point
 * @param {*} p1 Transition rate in first direction to be written at the edge
 * @param {*} p2 Transition rate in second direction to be written at the edge
 * @param {*} mark1 Highlight first direction
 * @param {*} mark2 Highlight second direction
 */
function drawConnection(ctx, x1, y1, x2, y2, p1, p2, mark1, mark2) {
  x1=Math.round(x1*canvasWidth);
  y1=Math.round(y1*canvasHeight);
  x2=Math.round(x2*canvasWidth);
  y2=Math.round(y2*canvasHeight);

  if (x1<x2) {x1+=30; x2-=30;}
  if (x1>x2) {x1-=30; x2+=30;}
  if (y1<y2) {y1+=30; y2-=30;}
  if (y1>y2) {y1-=30; y2+=30;}

  if (x2>x1 && y2>y1) {
    drawArrow(ctx,x1+5,y1-5,x2+5,y2-5,p1,mark1,true);
    drawArrow(ctx,x2-5,y2+5,x1-5,y1+5,p2,mark2,false);
  } else {
    drawArrow(ctx,x1-5,y1-5,x2-5,y2-5,p1,mark1,true);
    drawArrow(ctx,x2+5,y2+5,x1+5,y1+5,p2,mark2,false);
  }
}

/**
 * Draws a Markov graph with between 2 and 6 states.
 * @param {Object} canvas Canvas object to draw in
 * @param {Array} matrix Transition matrix
 * @param {Number} fromState Old state
 * @param {Number} toState New/current state
 */
function drawMarkovGraph(canvas, matrix, intensity, fromState, toState) {
  const ctx=canvas.getContext('2d');
  canvasWidth=canvas.width;
  canvasHeight=canvas.height;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const circle=[];
  switch (matrix.length) {
    case 2:
    circle.push([0.2,0.5,0.1,0.5]);
    circle.push([0.8,0.5,0.9,0.5]);
    break;
  case 3:
    circle.push([0.2,0.5,0.1,0.5]);
    circle.push([0.8,0.2,0.9,0.2]);
    circle.push([0.8,0.8,0.9,0.8]);
    break;
  case 4:
    circle.push([0.2,0.2,0.1,0.2]);
    circle.push([0.2,0.8,0.1,0.8]);
    circle.push([0.8,0.2,0.9,0.2]);
    circle.push([0.8,0.8,0.9,0.8]);
    break;
  case 5:
    circle.push([0.2,0.5,0.1,0.5]);
    circle.push([0.4,0.2,0.4,0.15]);
    circle.push([0.8,0.3,0.9,0.3]);
    circle.push([0.8,0.7,0.9,0.7]);
    circle.push([0.4,0.8,0.4,0.85]);
    break;
  case 6:
    circle.push([0.15,0.5,0.1,0.5]);
    circle.push([0.3,0.2,0.3,0.15]);
    circle.push([0.7,0.2,0.7,0.15]);
    circle.push([0.85,0.5,0.9,0.5]);
    circle.push([0.7,0.8,0.7,0.85]);
    circle.push([0.3,0.8,0.3,0.85]);
    break;
  }

  for (let i=0;i<circle.length;i++) {
    drawCircle(ctx,circle[i][0],circle[i][1],i+1,toState==i+1,(intensity==null)?1:intensity[i]);
  }

  for (let i=0;i<circle.length;i++) {
    if (fromState==i+1 && toState==i+1) ctx.fillStyle="red"; else ctx.fillStyle="black";
    ctx.font="10px Arial";
    ctx.fillText(formatNumber(Math.abs(matrix[i][i])),formatNumber(canvasWidth*circle[i][2]-3),formatNumber(canvasHeight*circle[i][3]+4));
    for (let j=i+1;j<circle.length;j++) {
      drawConnection(ctx,circle[i][0],circle[i][1],circle[j][0],circle[j][1],matrix[i][j],matrix[j][i],(fromState==i+1 && toState==j+1),(fromState==j+1 && toState==i+1));
    }
  }
}

/**
 * Clears the canvas.
 * @param {Object} canvas Canvas object to draw in
 */
function clearMarkovGraph(canvas) {
  const ctx=canvas.getContext('2d');
  canvasWidth=canvas.width;
  canvasHeight=canvas.height;
  ctx.clearRect(0,0,canvas.width,canvas.height);
}