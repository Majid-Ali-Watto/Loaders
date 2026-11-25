// Built-in variants, one named export each.
// Pure objects with no side effects, so bundlers drop the ones you don't import.
//
//   import { Loader } from "circle-loader/core";
//   import { dots } from "circle-loader/variants";
//   Loader.start({ variant: dots });
import { circle } from "./core.js";

import ringCss from "./styles/variants/ring.css";
import dualCss from "./styles/variants/dual.css";
import dotsCss from "./styles/variants/dots.css";
import pulseCss from "./styles/variants/pulse.css";
import orbitCss from "./styles/variants/orbit.css";
import rippleCss from "./styles/variants/ripple.css";
import cometCss from "./styles/variants/comet.css";
import bounceCss from "./styles/variants/bounce.css";
import spokesCss from "./styles/variants/spokes.css";
import arcCss from "./styles/variants/arc.css";
import flipCss from "./styles/variants/flip.css";
import clockCss from "./styles/variants/clock.css";
import gyroCss from "./styles/variants/gyro.css";
import fillCss from "./styles/variants/fill.css";
import moonCss from "./styles/variants/moon.css";
import chaseCss from "./styles/variants/chase.css";
import glowCss from "./styles/variants/glow.css";
import radarCss from "./styles/variants/radar.css";
import dashedCss from "./styles/variants/dashed.css";
import halvesCss from "./styles/variants/halves.css";
import ringsCss from "./styles/variants/rings.css";
import planetsCss from "./styles/variants/planets.css";
import squishCss from "./styles/variants/squish.css";
import eclipseCss from "./styles/variants/eclipse.css";
import segmentsCss from "./styles/variants/segments.css";
import flowerCss from "./styles/variants/flower.css";
import targetCss from "./styles/variants/target.css";
import pendulumCss from "./styles/variants/pendulum.css";
import donutCss from "./styles/variants/donut.css";
import waveCss from "./styles/variants/wave.css";
import heartbeatCss from "./styles/variants/heartbeat.css";
import yinyangCss from "./styles/variants/yinyang.css";
import atomCss from "./styles/variants/atom.css";
import quartersCss from "./styles/variants/quarters.css";
import globeCss from "./styles/variants/globe.css";
import swapCss from "./styles/variants/swap.css";
import ballCss from "./styles/variants/ball.css";
import wheelCss from "./styles/variants/wheel.css";
import fanCss from "./styles/variants/fan.css";
import breatheCss from "./styles/variants/breathe.css";
import gearCss from "./styles/variants/gear.css";
import splitCss from "./styles/variants/split.css";
import stripesCss from "./styles/variants/stripes.css";
import waterCss from "./styles/variants/water.css";
import tunnelCss from "./styles/variants/tunnel.css";
import typingCss from "./styles/variants/typing.css";
import eyeCss from "./styles/variants/eye.css";
import sunCss from "./styles/variants/sun.css";
import fizzCss from "./styles/variants/fizz.css";

const SVG_NS = "http://www.w3.org/2000/svg";

// The "arc" variant animates an SVG circle's stroke.
function buildArc(spinner) {
	const svg = document.createElementNS(SVG_NS, "svg");
	svg.setAttribute("viewBox", "0 0 50 50");
	const ring = document.createElementNS(SVG_NS, "circle");
	ring.setAttribute("cx", "25");
	ring.setAttribute("cy", "25");
	ring.setAttribute("r", "20");
	svg.appendChild(ring);
	spinner.appendChild(svg);
}

export { circle };

export const ring = { name: "ring", css: ringCss };
export const dual = { name: "dual", css: dualCss };
export const dots = { name: "dots", css: dotsCss, spans: 8 };
export const pulse = { name: "pulse", css: pulseCss };
export const orbit = { name: "orbit", css: orbitCss };
export const ripple = { name: "ripple", css: rippleCss };
export const comet = { name: "comet", css: cometCss };
export const bounce = { name: "bounce", css: bounceCss };
export const spokes = { name: "spokes", css: spokesCss, spans: 12 };
export const arc = { name: "arc", css: arcCss, build: buildArc };
export const flip = { name: "flip", css: flipCss };
export const clock = { name: "clock", css: clockCss };
export const gyro = { name: "gyro", css: gyroCss, spans: 2 };
export const fill = { name: "fill", css: fillCss };
export const moon = { name: "moon", css: moonCss };
export const chase = { name: "chase", css: chaseCss, spans: 6 };
export const glow = { name: "glow", css: glowCss };
export const radar = { name: "radar", css: radarCss };
export const dashed = { name: "dashed", css: dashedCss };
export const halves = { name: "halves", css: halvesCss };
export const rings = { name: "rings", css: ringsCss, spans: 3 };
export const planets = { name: "planets", css: planetsCss, spans: 3 };
export const squish = { name: "squish", css: squishCss };
export const eclipse = { name: "eclipse", css: eclipseCss };
export const segments = { name: "segments", css: segmentsCss };
export const flower = { name: "flower", css: flowerCss, spans: 6 };
export const target = { name: "target", css: targetCss, spans: 3 };
export const pendulum = { name: "pendulum", css: pendulumCss };
export const donut = { name: "donut", css: donutCss };
export const wave = { name: "wave", css: waveCss, spans: 8 };
export const heartbeat = { name: "heartbeat", css: heartbeatCss };
export const yinyang = { name: "yinyang", css: yinyangCss };
export const atom = { name: "atom", css: atomCss, spans: 3 };
export const quarters = { name: "quarters", css: quartersCss, spans: 4 };
export const globe = { name: "globe", css: globeCss, spans: 2 };
export const swap = { name: "swap", css: swapCss, spans: 2 };
export const ball = { name: "ball", css: ballCss };
export const wheel = { name: "wheel", css: wheelCss };
export const fan = { name: "fan", css: fanCss };
export const breathe = { name: "breathe", css: breatheCss };
export const gear = { name: "gear", css: gearCss };
export const split = { name: "split", css: splitCss };
export const stripes = { name: "stripes", css: stripesCss };
export const water = { name: "water", css: waterCss };
export const tunnel = { name: "tunnel", css: tunnelCss, spans: 3 };
export const typing = { name: "typing", css: typingCss, spans: 3 };
export const eye = { name: "eye", css: eyeCss };
export const sun = { name: "sun", css: sunCss };
export const fizz = { name: "fizz", css: fizzCss, spans: 4 };

/** Every built-in variant, in display order. Importing this keeps them all in your bundle. */
export const allVariants = [circle, ring, dual, dots, pulse, orbit, ripple, comet, bounce, spokes, arc, flip, clock, gyro, fill, moon, chase, glow, radar, dashed, halves, rings, planets, squish, eclipse, segments, flower, target, pendulum, donut, wave, heartbeat, yinyang, atom, quarters, globe, swap, ball, wheel, fan, breathe, gear, split, stripes, water, tunnel, typing, eye, sun, fizz];
