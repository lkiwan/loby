(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))r(l);new MutationObserver(l=>{for(const o of l)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function n(l){const o={};return l.integrity&&(o.integrity=l.integrity),l.referrerPolicy&&(o.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?o.credentials="include":l.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(l){if(l.ep)return;l.ep=!0;const o=n(l);fetch(l.href,o)}})();var Ga={exports:{}},ll={},Ka={exports:{}},F={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Zn=Symbol.for("react.element"),pc=Symbol.for("react.portal"),mc=Symbol.for("react.fragment"),hc=Symbol.for("react.strict_mode"),vc=Symbol.for("react.profiler"),gc=Symbol.for("react.provider"),xc=Symbol.for("react.context"),yc=Symbol.for("react.forward_ref"),wc=Symbol.for("react.suspense"),kc=Symbol.for("react.memo"),Sc=Symbol.for("react.lazy"),Mi=Symbol.iterator;function Ec(e){return e===null||typeof e!="object"?null:(e=Mi&&e[Mi]||e["@@iterator"],typeof e=="function"?e:null)}var Xa={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Za=Object.assign,qa={};function sn(e,t,n){this.props=e,this.context=t,this.refs=qa,this.updater=n||Xa}sn.prototype.isReactComponent={};sn.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};sn.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Ja(){}Ja.prototype=sn.prototype;function Wo(e,t,n){this.props=e,this.context=t,this.refs=qa,this.updater=n||Xa}var Ho=Wo.prototype=new Ja;Ho.constructor=Wo;Za(Ho,sn.prototype);Ho.isPureReactComponent=!0;var Ui=Array.isArray,es=Object.prototype.hasOwnProperty,Yo={current:null},ts={key:!0,ref:!0,__self:!0,__source:!0};function ns(e,t,n){var r,l={},o=null,i=null;if(t!=null)for(r in t.ref!==void 0&&(i=t.ref),t.key!==void 0&&(o=""+t.key),t)es.call(t,r)&&!ts.hasOwnProperty(r)&&(l[r]=t[r]);var a=arguments.length-2;if(a===1)l.children=n;else if(1<a){for(var s=Array(a),f=0;f<a;f++)s[f]=arguments[f+2];l.children=s}if(e&&e.defaultProps)for(r in a=e.defaultProps,a)l[r]===void 0&&(l[r]=a[r]);return{$$typeof:Zn,type:e,key:o,ref:i,props:l,_owner:Yo.current}}function Cc(e,t){return{$$typeof:Zn,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function Qo(e){return typeof e=="object"&&e!==null&&e.$$typeof===Zn}function Nc(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var bi=/\/+/g;function El(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Nc(""+e.key):t.toString(36)}function kr(e,t,n,r,l){var o=typeof e;(o==="undefined"||o==="boolean")&&(e=null);var i=!1;if(e===null)i=!0;else switch(o){case"string":case"number":i=!0;break;case"object":switch(e.$$typeof){case Zn:case pc:i=!0}}if(i)return i=e,l=l(i),e=r===""?"."+El(i,0):r,Ui(l)?(n="",e!=null&&(n=e.replace(bi,"$&/")+"/"),kr(l,t,n,"",function(f){return f})):l!=null&&(Qo(l)&&(l=Cc(l,n+(!l.key||i&&i.key===l.key?"":(""+l.key).replace(bi,"$&/")+"/")+e)),t.push(l)),1;if(i=0,r=r===""?".":r+":",Ui(e))for(var a=0;a<e.length;a++){o=e[a];var s=r+El(o,a);i+=kr(o,t,n,s,l)}else if(s=Ec(e),typeof s=="function")for(e=s.call(e),a=0;!(o=e.next()).done;)o=o.value,s=r+El(o,a++),i+=kr(o,t,n,s,l);else if(o==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return i}function lr(e,t,n){if(e==null)return e;var r=[],l=0;return kr(e,r,"","",function(o){return t.call(n,o,l++)}),r}function jc(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var ue={current:null},Sr={transition:null},zc={ReactCurrentDispatcher:ue,ReactCurrentBatchConfig:Sr,ReactCurrentOwner:Yo};function rs(){throw Error("act(...) is not supported in production builds of React.")}F.Children={map:lr,forEach:function(e,t,n){lr(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return lr(e,function(){t++}),t},toArray:function(e){return lr(e,function(t){return t})||[]},only:function(e){if(!Qo(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};F.Component=sn;F.Fragment=mc;F.Profiler=vc;F.PureComponent=Wo;F.StrictMode=hc;F.Suspense=wc;F.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=zc;F.act=rs;F.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=Za({},e.props),l=e.key,o=e.ref,i=e._owner;if(t!=null){if(t.ref!==void 0&&(o=t.ref,i=Yo.current),t.key!==void 0&&(l=""+t.key),e.type&&e.type.defaultProps)var a=e.type.defaultProps;for(s in t)es.call(t,s)&&!ts.hasOwnProperty(s)&&(r[s]=t[s]===void 0&&a!==void 0?a[s]:t[s])}var s=arguments.length-2;if(s===1)r.children=n;else if(1<s){a=Array(s);for(var f=0;f<s;f++)a[f]=arguments[f+2];r.children=a}return{$$typeof:Zn,type:e.type,key:l,ref:o,props:r,_owner:i}};F.createContext=function(e){return e={$$typeof:xc,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:gc,_context:e},e.Consumer=e};F.createElement=ns;F.createFactory=function(e){var t=ns.bind(null,e);return t.type=e,t};F.createRef=function(){return{current:null}};F.forwardRef=function(e){return{$$typeof:yc,render:e}};F.isValidElement=Qo;F.lazy=function(e){return{$$typeof:Sc,_payload:{_status:-1,_result:e},_init:jc}};F.memo=function(e,t){return{$$typeof:kc,type:e,compare:t===void 0?null:t}};F.startTransition=function(e){var t=Sr.transition;Sr.transition={};try{e()}finally{Sr.transition=t}};F.unstable_act=rs;F.useCallback=function(e,t){return ue.current.useCallback(e,t)};F.useContext=function(e){return ue.current.useContext(e)};F.useDebugValue=function(){};F.useDeferredValue=function(e){return ue.current.useDeferredValue(e)};F.useEffect=function(e,t){return ue.current.useEffect(e,t)};F.useId=function(){return ue.current.useId()};F.useImperativeHandle=function(e,t,n){return ue.current.useImperativeHandle(e,t,n)};F.useInsertionEffect=function(e,t){return ue.current.useInsertionEffect(e,t)};F.useLayoutEffect=function(e,t){return ue.current.useLayoutEffect(e,t)};F.useMemo=function(e,t){return ue.current.useMemo(e,t)};F.useReducer=function(e,t,n){return ue.current.useReducer(e,t,n)};F.useRef=function(e){return ue.current.useRef(e)};F.useState=function(e){return ue.current.useState(e)};F.useSyncExternalStore=function(e,t,n){return ue.current.useSyncExternalStore(e,t,n)};F.useTransition=function(){return ue.current.useTransition()};F.version="18.3.1";Ka.exports=F;var T=Ka.exports;/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Lc=T,_c=Symbol.for("react.element"),Pc=Symbol.for("react.fragment"),Fc=Object.prototype.hasOwnProperty,Tc=Lc.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Rc={key:!0,ref:!0,__self:!0,__source:!0};function ls(e,t,n){var r,l={},o=null,i=null;n!==void 0&&(o=""+n),t.key!==void 0&&(o=""+t.key),t.ref!==void 0&&(i=t.ref);for(r in t)Fc.call(t,r)&&!Rc.hasOwnProperty(r)&&(l[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)l[r]===void 0&&(l[r]=t[r]);return{$$typeof:_c,type:e,key:o,ref:i,props:l,_owner:Tc.current}}ll.Fragment=Pc;ll.jsx=ls;ll.jsxs=ls;Ga.exports=ll;var u=Ga.exports,os={exports:{}},ke={},is={exports:{}},as={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function t(j,_){var P=j.length;j.push(_);e:for(;0<P;){var Y=P-1>>>1,Z=j[Y];if(0<l(Z,_))j[Y]=_,j[P]=Z,P=Y;else break e}}function n(j){return j.length===0?null:j[0]}function r(j){if(j.length===0)return null;var _=j[0],P=j.pop();if(P!==_){j[0]=P;e:for(var Y=0,Z=j.length,nr=Z>>>1;Y<nr;){var xt=2*(Y+1)-1,Sl=j[xt],yt=xt+1,rr=j[yt];if(0>l(Sl,P))yt<Z&&0>l(rr,Sl)?(j[Y]=rr,j[yt]=P,Y=yt):(j[Y]=Sl,j[xt]=P,Y=xt);else if(yt<Z&&0>l(rr,P))j[Y]=rr,j[yt]=P,Y=yt;else break e}}return _}function l(j,_){var P=j.sortIndex-_.sortIndex;return P!==0?P:j.id-_.id}if(typeof performance=="object"&&typeof performance.now=="function"){var o=performance;e.unstable_now=function(){return o.now()}}else{var i=Date,a=i.now();e.unstable_now=function(){return i.now()-a}}var s=[],f=[],v=1,h=null,m=3,x=!1,w=!1,k=!1,R=typeof setTimeout=="function"?setTimeout:null,d=typeof clearTimeout=="function"?clearTimeout:null,c=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function p(j){for(var _=n(f);_!==null;){if(_.callback===null)r(f);else if(_.startTime<=j)r(f),_.sortIndex=_.expirationTime,t(s,_);else break;_=n(f)}}function g(j){if(k=!1,p(j),!w)if(n(s)!==null)w=!0,wl(S);else{var _=n(f);_!==null&&kl(g,_.startTime-j)}}function S(j,_){w=!1,k&&(k=!1,d(z),z=-1),x=!0;var P=m;try{for(p(_),h=n(s);h!==null&&(!(h.expirationTime>_)||j&&!H());){var Y=h.callback;if(typeof Y=="function"){h.callback=null,m=h.priorityLevel;var Z=Y(h.expirationTime<=_);_=e.unstable_now(),typeof Z=="function"?h.callback=Z:h===n(s)&&r(s),p(_)}else r(s);h=n(s)}if(h!==null)var nr=!0;else{var xt=n(f);xt!==null&&kl(g,xt.startTime-_),nr=!1}return nr}finally{h=null,m=P,x=!1}}var E=!1,N=null,z=-1,A=5,L=-1;function H(){return!(e.unstable_now()-L<A)}function de(){if(N!==null){var j=e.unstable_now();L=j;var _=!0;try{_=N(!0,j)}finally{_?Oe():(E=!1,N=null)}}else E=!1}var Oe;if(typeof c=="function")Oe=function(){c(de)};else if(typeof MessageChannel<"u"){var fn=new MessageChannel,fc=fn.port2;fn.port1.onmessage=de,Oe=function(){fc.postMessage(null)}}else Oe=function(){R(de,0)};function wl(j){N=j,E||(E=!0,Oe())}function kl(j,_){z=R(function(){j(e.unstable_now())},_)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(j){j.callback=null},e.unstable_continueExecution=function(){w||x||(w=!0,wl(S))},e.unstable_forceFrameRate=function(j){0>j||125<j?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):A=0<j?Math.floor(1e3/j):5},e.unstable_getCurrentPriorityLevel=function(){return m},e.unstable_getFirstCallbackNode=function(){return n(s)},e.unstable_next=function(j){switch(m){case 1:case 2:case 3:var _=3;break;default:_=m}var P=m;m=_;try{return j()}finally{m=P}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(j,_){switch(j){case 1:case 2:case 3:case 4:case 5:break;default:j=3}var P=m;m=j;try{return _()}finally{m=P}},e.unstable_scheduleCallback=function(j,_,P){var Y=e.unstable_now();switch(typeof P=="object"&&P!==null?(P=P.delay,P=typeof P=="number"&&0<P?Y+P:Y):P=Y,j){case 1:var Z=-1;break;case 2:Z=250;break;case 5:Z=1073741823;break;case 4:Z=1e4;break;default:Z=5e3}return Z=P+Z,j={id:v++,callback:_,priorityLevel:j,startTime:P,expirationTime:Z,sortIndex:-1},P>Y?(j.sortIndex=P,t(f,j),n(s)===null&&j===n(f)&&(k?(d(z),z=-1):k=!0,kl(g,P-Y))):(j.sortIndex=Z,t(s,j),w||x||(w=!0,wl(S))),j},e.unstable_shouldYield=H,e.unstable_wrapCallback=function(j){var _=m;return function(){var P=m;m=_;try{return j.apply(this,arguments)}finally{m=P}}}})(as);is.exports=as;var Ic=is.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ac=T,we=Ic;function y(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var ss=new Set,In={};function Tt(e,t){en(e,t),en(e+"Capture",t)}function en(e,t){for(In[e]=t,e=0;e<t.length;e++)ss.add(t[e])}var Qe=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Kl=Object.prototype.hasOwnProperty,Oc=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Bi={},$i={};function Dc(e){return Kl.call($i,e)?!0:Kl.call(Bi,e)?!1:Oc.test(e)?$i[e]=!0:(Bi[e]=!0,!1)}function Mc(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function Uc(e,t,n,r){if(t===null||typeof t>"u"||Mc(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function ce(e,t,n,r,l,o,i){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=l,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=o,this.removeEmptyString=i}var ne={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){ne[e]=new ce(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];ne[t]=new ce(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){ne[e]=new ce(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){ne[e]=new ce(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){ne[e]=new ce(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){ne[e]=new ce(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){ne[e]=new ce(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){ne[e]=new ce(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){ne[e]=new ce(e,5,!1,e.toLowerCase(),null,!1,!1)});var Go=/[\-:]([a-z])/g;function Ko(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Go,Ko);ne[t]=new ce(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Go,Ko);ne[t]=new ce(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Go,Ko);ne[t]=new ce(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){ne[e]=new ce(e,1,!1,e.toLowerCase(),null,!1,!1)});ne.xlinkHref=new ce("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){ne[e]=new ce(e,1,!1,e.toLowerCase(),null,!0,!0)});function Xo(e,t,n,r){var l=ne.hasOwnProperty(t)?ne[t]:null;(l!==null?l.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(Uc(t,n,l,r)&&(n=null),r||l===null?Dc(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):l.mustUseProperty?e[l.propertyName]=n===null?l.type===3?!1:"":n:(t=l.attributeName,r=l.attributeNamespace,n===null?e.removeAttribute(t):(l=l.type,n=l===3||l===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var Ze=Ac.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,or=Symbol.for("react.element"),Ot=Symbol.for("react.portal"),Dt=Symbol.for("react.fragment"),Zo=Symbol.for("react.strict_mode"),Xl=Symbol.for("react.profiler"),us=Symbol.for("react.provider"),cs=Symbol.for("react.context"),qo=Symbol.for("react.forward_ref"),Zl=Symbol.for("react.suspense"),ql=Symbol.for("react.suspense_list"),Jo=Symbol.for("react.memo"),Je=Symbol.for("react.lazy"),ds=Symbol.for("react.offscreen"),Vi=Symbol.iterator;function pn(e){return e===null||typeof e!="object"?null:(e=Vi&&e[Vi]||e["@@iterator"],typeof e=="function"?e:null)}var V=Object.assign,Cl;function kn(e){if(Cl===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Cl=t&&t[1]||""}return`
`+Cl+e}var Nl=!1;function jl(e,t){if(!e||Nl)return"";Nl=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(f){var r=f}Reflect.construct(e,[],t)}else{try{t.call()}catch(f){r=f}e.call(t.prototype)}else{try{throw Error()}catch(f){r=f}e()}}catch(f){if(f&&r&&typeof f.stack=="string"){for(var l=f.stack.split(`
`),o=r.stack.split(`
`),i=l.length-1,a=o.length-1;1<=i&&0<=a&&l[i]!==o[a];)a--;for(;1<=i&&0<=a;i--,a--)if(l[i]!==o[a]){if(i!==1||a!==1)do if(i--,a--,0>a||l[i]!==o[a]){var s=`
`+l[i].replace(" at new "," at ");return e.displayName&&s.includes("<anonymous>")&&(s=s.replace("<anonymous>",e.displayName)),s}while(1<=i&&0<=a);break}}}finally{Nl=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?kn(e):""}function bc(e){switch(e.tag){case 5:return kn(e.type);case 16:return kn("Lazy");case 13:return kn("Suspense");case 19:return kn("SuspenseList");case 0:case 2:case 15:return e=jl(e.type,!1),e;case 11:return e=jl(e.type.render,!1),e;case 1:return e=jl(e.type,!0),e;default:return""}}function Jl(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Dt:return"Fragment";case Ot:return"Portal";case Xl:return"Profiler";case Zo:return"StrictMode";case Zl:return"Suspense";case ql:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case cs:return(e.displayName||"Context")+".Consumer";case us:return(e._context.displayName||"Context")+".Provider";case qo:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Jo:return t=e.displayName||null,t!==null?t:Jl(e.type)||"Memo";case Je:t=e._payload,e=e._init;try{return Jl(e(t))}catch{}}return null}function Bc(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Jl(t);case 8:return t===Zo?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function pt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function fs(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function $c(e){var t=fs(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var l=n.get,o=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return l.call(this)},set:function(i){r=""+i,o.call(this,i)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(i){r=""+i},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function ir(e){e._valueTracker||(e._valueTracker=$c(e))}function ps(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=fs(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function Rr(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function eo(e,t){var n=t.checked;return V({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function Wi(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=pt(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function ms(e,t){t=t.checked,t!=null&&Xo(e,"checked",t,!1)}function to(e,t){ms(e,t);var n=pt(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?no(e,t.type,n):t.hasOwnProperty("defaultValue")&&no(e,t.type,pt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Hi(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function no(e,t,n){(t!=="number"||Rr(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var Sn=Array.isArray;function Gt(e,t,n,r){if(e=e.options,t){t={};for(var l=0;l<n.length;l++)t["$"+n[l]]=!0;for(n=0;n<e.length;n++)l=t.hasOwnProperty("$"+e[n].value),e[n].selected!==l&&(e[n].selected=l),l&&r&&(e[n].defaultSelected=!0)}else{for(n=""+pt(n),t=null,l=0;l<e.length;l++){if(e[l].value===n){e[l].selected=!0,r&&(e[l].defaultSelected=!0);return}t!==null||e[l].disabled||(t=e[l])}t!==null&&(t.selected=!0)}}function ro(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(y(91));return V({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Yi(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(y(92));if(Sn(n)){if(1<n.length)throw Error(y(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:pt(n)}}function hs(e,t){var n=pt(t.value),r=pt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function Qi(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function vs(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function lo(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?vs(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var ar,gs=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,l){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,l)})}:e}(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(ar=ar||document.createElement("div"),ar.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=ar.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function An(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Nn={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Vc=["Webkit","ms","Moz","O"];Object.keys(Nn).forEach(function(e){Vc.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Nn[t]=Nn[e]})});function xs(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Nn.hasOwnProperty(e)&&Nn[e]?(""+t).trim():t+"px"}function ys(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,l=xs(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,l):e[n]=l}}var Wc=V({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function oo(e,t){if(t){if(Wc[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(y(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(y(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(y(61))}if(t.style!=null&&typeof t.style!="object")throw Error(y(62))}}function io(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ao=null;function ei(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var so=null,Kt=null,Xt=null;function Gi(e){if(e=er(e)){if(typeof so!="function")throw Error(y(280));var t=e.stateNode;t&&(t=ul(t),so(e.stateNode,e.type,t))}}function ws(e){Kt?Xt?Xt.push(e):Xt=[e]:Kt=e}function ks(){if(Kt){var e=Kt,t=Xt;if(Xt=Kt=null,Gi(e),t)for(e=0;e<t.length;e++)Gi(t[e])}}function Ss(e,t){return e(t)}function Es(){}var zl=!1;function Cs(e,t,n){if(zl)return e(t,n);zl=!0;try{return Ss(e,t,n)}finally{zl=!1,(Kt!==null||Xt!==null)&&(Es(),ks())}}function On(e,t){var n=e.stateNode;if(n===null)return null;var r=ul(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(y(231,t,typeof n));return n}var uo=!1;if(Qe)try{var mn={};Object.defineProperty(mn,"passive",{get:function(){uo=!0}}),window.addEventListener("test",mn,mn),window.removeEventListener("test",mn,mn)}catch{uo=!1}function Hc(e,t,n,r,l,o,i,a,s){var f=Array.prototype.slice.call(arguments,3);try{t.apply(n,f)}catch(v){this.onError(v)}}var jn=!1,Ir=null,Ar=!1,co=null,Yc={onError:function(e){jn=!0,Ir=e}};function Qc(e,t,n,r,l,o,i,a,s){jn=!1,Ir=null,Hc.apply(Yc,arguments)}function Gc(e,t,n,r,l,o,i,a,s){if(Qc.apply(this,arguments),jn){if(jn){var f=Ir;jn=!1,Ir=null}else throw Error(y(198));Ar||(Ar=!0,co=f)}}function Rt(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function Ns(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Ki(e){if(Rt(e)!==e)throw Error(y(188))}function Kc(e){var t=e.alternate;if(!t){if(t=Rt(e),t===null)throw Error(y(188));return t!==e?null:e}for(var n=e,r=t;;){var l=n.return;if(l===null)break;var o=l.alternate;if(o===null){if(r=l.return,r!==null){n=r;continue}break}if(l.child===o.child){for(o=l.child;o;){if(o===n)return Ki(l),e;if(o===r)return Ki(l),t;o=o.sibling}throw Error(y(188))}if(n.return!==r.return)n=l,r=o;else{for(var i=!1,a=l.child;a;){if(a===n){i=!0,n=l,r=o;break}if(a===r){i=!0,r=l,n=o;break}a=a.sibling}if(!i){for(a=o.child;a;){if(a===n){i=!0,n=o,r=l;break}if(a===r){i=!0,r=o,n=l;break}a=a.sibling}if(!i)throw Error(y(189))}}if(n.alternate!==r)throw Error(y(190))}if(n.tag!==3)throw Error(y(188));return n.stateNode.current===n?e:t}function js(e){return e=Kc(e),e!==null?zs(e):null}function zs(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=zs(e);if(t!==null)return t;e=e.sibling}return null}var Ls=we.unstable_scheduleCallback,Xi=we.unstable_cancelCallback,Xc=we.unstable_shouldYield,Zc=we.unstable_requestPaint,Q=we.unstable_now,qc=we.unstable_getCurrentPriorityLevel,ti=we.unstable_ImmediatePriority,_s=we.unstable_UserBlockingPriority,Or=we.unstable_NormalPriority,Jc=we.unstable_LowPriority,Ps=we.unstable_IdlePriority,ol=null,be=null;function ed(e){if(be&&typeof be.onCommitFiberRoot=="function")try{be.onCommitFiberRoot(ol,e,void 0,(e.current.flags&128)===128)}catch{}}var Re=Math.clz32?Math.clz32:rd,td=Math.log,nd=Math.LN2;function rd(e){return e>>>=0,e===0?32:31-(td(e)/nd|0)|0}var sr=64,ur=4194304;function En(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Dr(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,l=e.suspendedLanes,o=e.pingedLanes,i=n&268435455;if(i!==0){var a=i&~l;a!==0?r=En(a):(o&=i,o!==0&&(r=En(o)))}else i=n&~l,i!==0?r=En(i):o!==0&&(r=En(o));if(r===0)return 0;if(t!==0&&t!==r&&!(t&l)&&(l=r&-r,o=t&-t,l>=o||l===16&&(o&4194240)!==0))return t;if(r&4&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-Re(t),l=1<<n,r|=e[n],t&=~l;return r}function ld(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function od(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,l=e.expirationTimes,o=e.pendingLanes;0<o;){var i=31-Re(o),a=1<<i,s=l[i];s===-1?(!(a&n)||a&r)&&(l[i]=ld(a,t)):s<=t&&(e.expiredLanes|=a),o&=~a}}function fo(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Fs(){var e=sr;return sr<<=1,!(sr&4194240)&&(sr=64),e}function Ll(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function qn(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-Re(t),e[t]=n}function id(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var l=31-Re(n),o=1<<l;t[l]=0,r[l]=-1,e[l]=-1,n&=~o}}function ni(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Re(n),l=1<<r;l&t|e[r]&t&&(e[r]|=t),n&=~l}}var O=0;function Ts(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var Rs,ri,Is,As,Os,po=!1,cr=[],ot=null,it=null,at=null,Dn=new Map,Mn=new Map,tt=[],ad="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Zi(e,t){switch(e){case"focusin":case"focusout":ot=null;break;case"dragenter":case"dragleave":it=null;break;case"mouseover":case"mouseout":at=null;break;case"pointerover":case"pointerout":Dn.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Mn.delete(t.pointerId)}}function hn(e,t,n,r,l,o){return e===null||e.nativeEvent!==o?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:o,targetContainers:[l]},t!==null&&(t=er(t),t!==null&&ri(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,l!==null&&t.indexOf(l)===-1&&t.push(l),e)}function sd(e,t,n,r,l){switch(t){case"focusin":return ot=hn(ot,e,t,n,r,l),!0;case"dragenter":return it=hn(it,e,t,n,r,l),!0;case"mouseover":return at=hn(at,e,t,n,r,l),!0;case"pointerover":var o=l.pointerId;return Dn.set(o,hn(Dn.get(o)||null,e,t,n,r,l)),!0;case"gotpointercapture":return o=l.pointerId,Mn.set(o,hn(Mn.get(o)||null,e,t,n,r,l)),!0}return!1}function Ds(e){var t=St(e.target);if(t!==null){var n=Rt(t);if(n!==null){if(t=n.tag,t===13){if(t=Ns(n),t!==null){e.blockedOn=t,Os(e.priority,function(){Is(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Er(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=mo(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);ao=r,n.target.dispatchEvent(r),ao=null}else return t=er(n),t!==null&&ri(t),e.blockedOn=n,!1;t.shift()}return!0}function qi(e,t,n){Er(e)&&n.delete(t)}function ud(){po=!1,ot!==null&&Er(ot)&&(ot=null),it!==null&&Er(it)&&(it=null),at!==null&&Er(at)&&(at=null),Dn.forEach(qi),Mn.forEach(qi)}function vn(e,t){e.blockedOn===t&&(e.blockedOn=null,po||(po=!0,we.unstable_scheduleCallback(we.unstable_NormalPriority,ud)))}function Un(e){function t(l){return vn(l,e)}if(0<cr.length){vn(cr[0],e);for(var n=1;n<cr.length;n++){var r=cr[n];r.blockedOn===e&&(r.blockedOn=null)}}for(ot!==null&&vn(ot,e),it!==null&&vn(it,e),at!==null&&vn(at,e),Dn.forEach(t),Mn.forEach(t),n=0;n<tt.length;n++)r=tt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<tt.length&&(n=tt[0],n.blockedOn===null);)Ds(n),n.blockedOn===null&&tt.shift()}var Zt=Ze.ReactCurrentBatchConfig,Mr=!0;function cd(e,t,n,r){var l=O,o=Zt.transition;Zt.transition=null;try{O=1,li(e,t,n,r)}finally{O=l,Zt.transition=o}}function dd(e,t,n,r){var l=O,o=Zt.transition;Zt.transition=null;try{O=4,li(e,t,n,r)}finally{O=l,Zt.transition=o}}function li(e,t,n,r){if(Mr){var l=mo(e,t,n,r);if(l===null)Ml(e,t,r,Ur,n),Zi(e,r);else if(sd(l,e,t,n,r))r.stopPropagation();else if(Zi(e,r),t&4&&-1<ad.indexOf(e)){for(;l!==null;){var o=er(l);if(o!==null&&Rs(o),o=mo(e,t,n,r),o===null&&Ml(e,t,r,Ur,n),o===l)break;l=o}l!==null&&r.stopPropagation()}else Ml(e,t,r,null,n)}}var Ur=null;function mo(e,t,n,r){if(Ur=null,e=ei(r),e=St(e),e!==null)if(t=Rt(e),t===null)e=null;else if(n=t.tag,n===13){if(e=Ns(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return Ur=e,null}function Ms(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(qc()){case ti:return 1;case _s:return 4;case Or:case Jc:return 16;case Ps:return 536870912;default:return 16}default:return 16}}var rt=null,oi=null,Cr=null;function Us(){if(Cr)return Cr;var e,t=oi,n=t.length,r,l="value"in rt?rt.value:rt.textContent,o=l.length;for(e=0;e<n&&t[e]===l[e];e++);var i=n-e;for(r=1;r<=i&&t[n-r]===l[o-r];r++);return Cr=l.slice(e,1<r?1-r:void 0)}function Nr(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function dr(){return!0}function Ji(){return!1}function Se(e){function t(n,r,l,o,i){this._reactName=n,this._targetInst=l,this.type=r,this.nativeEvent=o,this.target=i,this.currentTarget=null;for(var a in e)e.hasOwnProperty(a)&&(n=e[a],this[a]=n?n(o):o[a]);return this.isDefaultPrevented=(o.defaultPrevented!=null?o.defaultPrevented:o.returnValue===!1)?dr:Ji,this.isPropagationStopped=Ji,this}return V(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=dr)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=dr)},persist:function(){},isPersistent:dr}),t}var un={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ii=Se(un),Jn=V({},un,{view:0,detail:0}),fd=Se(Jn),_l,Pl,gn,il=V({},Jn,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ai,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==gn&&(gn&&e.type==="mousemove"?(_l=e.screenX-gn.screenX,Pl=e.screenY-gn.screenY):Pl=_l=0,gn=e),_l)},movementY:function(e){return"movementY"in e?e.movementY:Pl}}),ea=Se(il),pd=V({},il,{dataTransfer:0}),md=Se(pd),hd=V({},Jn,{relatedTarget:0}),Fl=Se(hd),vd=V({},un,{animationName:0,elapsedTime:0,pseudoElement:0}),gd=Se(vd),xd=V({},un,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),yd=Se(xd),wd=V({},un,{data:0}),ta=Se(wd),kd={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Sd={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Ed={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Cd(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Ed[e])?!!t[e]:!1}function ai(){return Cd}var Nd=V({},Jn,{key:function(e){if(e.key){var t=kd[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Nr(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Sd[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ai,charCode:function(e){return e.type==="keypress"?Nr(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Nr(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),jd=Se(Nd),zd=V({},il,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),na=Se(zd),Ld=V({},Jn,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ai}),_d=Se(Ld),Pd=V({},un,{propertyName:0,elapsedTime:0,pseudoElement:0}),Fd=Se(Pd),Td=V({},il,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Rd=Se(Td),Id=[9,13,27,32],si=Qe&&"CompositionEvent"in window,zn=null;Qe&&"documentMode"in document&&(zn=document.documentMode);var Ad=Qe&&"TextEvent"in window&&!zn,bs=Qe&&(!si||zn&&8<zn&&11>=zn),ra=" ",la=!1;function Bs(e,t){switch(e){case"keyup":return Id.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function $s(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Mt=!1;function Od(e,t){switch(e){case"compositionend":return $s(t);case"keypress":return t.which!==32?null:(la=!0,ra);case"textInput":return e=t.data,e===ra&&la?null:e;default:return null}}function Dd(e,t){if(Mt)return e==="compositionend"||!si&&Bs(e,t)?(e=Us(),Cr=oi=rt=null,Mt=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return bs&&t.locale!=="ko"?null:t.data;default:return null}}var Md={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function oa(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Md[e.type]:t==="textarea"}function Vs(e,t,n,r){ws(r),t=br(t,"onChange"),0<t.length&&(n=new ii("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Ln=null,bn=null;function Ud(e){eu(e,0)}function al(e){var t=Bt(e);if(ps(t))return e}function bd(e,t){if(e==="change")return t}var Ws=!1;if(Qe){var Tl;if(Qe){var Rl="oninput"in document;if(!Rl){var ia=document.createElement("div");ia.setAttribute("oninput","return;"),Rl=typeof ia.oninput=="function"}Tl=Rl}else Tl=!1;Ws=Tl&&(!document.documentMode||9<document.documentMode)}function aa(){Ln&&(Ln.detachEvent("onpropertychange",Hs),bn=Ln=null)}function Hs(e){if(e.propertyName==="value"&&al(bn)){var t=[];Vs(t,bn,e,ei(e)),Cs(Ud,t)}}function Bd(e,t,n){e==="focusin"?(aa(),Ln=t,bn=n,Ln.attachEvent("onpropertychange",Hs)):e==="focusout"&&aa()}function $d(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return al(bn)}function Vd(e,t){if(e==="click")return al(t)}function Wd(e,t){if(e==="input"||e==="change")return al(t)}function Hd(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Ae=typeof Object.is=="function"?Object.is:Hd;function Bn(e,t){if(Ae(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var l=n[r];if(!Kl.call(t,l)||!Ae(e[l],t[l]))return!1}return!0}function sa(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ua(e,t){var n=sa(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=sa(n)}}function Ys(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Ys(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Qs(){for(var e=window,t=Rr();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Rr(e.document)}return t}function ui(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function Yd(e){var t=Qs(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&Ys(n.ownerDocument.documentElement,n)){if(r!==null&&ui(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var l=n.textContent.length,o=Math.min(r.start,l);r=r.end===void 0?o:Math.min(r.end,l),!e.extend&&o>r&&(l=r,r=o,o=l),l=ua(n,o);var i=ua(n,r);l&&i&&(e.rangeCount!==1||e.anchorNode!==l.node||e.anchorOffset!==l.offset||e.focusNode!==i.node||e.focusOffset!==i.offset)&&(t=t.createRange(),t.setStart(l.node,l.offset),e.removeAllRanges(),o>r?(e.addRange(t),e.extend(i.node,i.offset)):(t.setEnd(i.node,i.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var Qd=Qe&&"documentMode"in document&&11>=document.documentMode,Ut=null,ho=null,_n=null,vo=!1;function ca(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;vo||Ut==null||Ut!==Rr(r)||(r=Ut,"selectionStart"in r&&ui(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),_n&&Bn(_n,r)||(_n=r,r=br(ho,"onSelect"),0<r.length&&(t=new ii("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Ut)))}function fr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var bt={animationend:fr("Animation","AnimationEnd"),animationiteration:fr("Animation","AnimationIteration"),animationstart:fr("Animation","AnimationStart"),transitionend:fr("Transition","TransitionEnd")},Il={},Gs={};Qe&&(Gs=document.createElement("div").style,"AnimationEvent"in window||(delete bt.animationend.animation,delete bt.animationiteration.animation,delete bt.animationstart.animation),"TransitionEvent"in window||delete bt.transitionend.transition);function sl(e){if(Il[e])return Il[e];if(!bt[e])return e;var t=bt[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Gs)return Il[e]=t[n];return e}var Ks=sl("animationend"),Xs=sl("animationiteration"),Zs=sl("animationstart"),qs=sl("transitionend"),Js=new Map,da="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function ht(e,t){Js.set(e,t),Tt(t,[e])}for(var Al=0;Al<da.length;Al++){var Ol=da[Al],Gd=Ol.toLowerCase(),Kd=Ol[0].toUpperCase()+Ol.slice(1);ht(Gd,"on"+Kd)}ht(Ks,"onAnimationEnd");ht(Xs,"onAnimationIteration");ht(Zs,"onAnimationStart");ht("dblclick","onDoubleClick");ht("focusin","onFocus");ht("focusout","onBlur");ht(qs,"onTransitionEnd");en("onMouseEnter",["mouseout","mouseover"]);en("onMouseLeave",["mouseout","mouseover"]);en("onPointerEnter",["pointerout","pointerover"]);en("onPointerLeave",["pointerout","pointerover"]);Tt("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Tt("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Tt("onBeforeInput",["compositionend","keypress","textInput","paste"]);Tt("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Tt("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Tt("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Cn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Xd=new Set("cancel close invalid load scroll toggle".split(" ").concat(Cn));function fa(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,Gc(r,t,void 0,e),e.currentTarget=null}function eu(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],l=r.event;r=r.listeners;e:{var o=void 0;if(t)for(var i=r.length-1;0<=i;i--){var a=r[i],s=a.instance,f=a.currentTarget;if(a=a.listener,s!==o&&l.isPropagationStopped())break e;fa(l,a,f),o=s}else for(i=0;i<r.length;i++){if(a=r[i],s=a.instance,f=a.currentTarget,a=a.listener,s!==o&&l.isPropagationStopped())break e;fa(l,a,f),o=s}}}if(Ar)throw e=co,Ar=!1,co=null,e}function M(e,t){var n=t[ko];n===void 0&&(n=t[ko]=new Set);var r=e+"__bubble";n.has(r)||(tu(t,e,2,!1),n.add(r))}function Dl(e,t,n){var r=0;t&&(r|=4),tu(n,e,r,t)}var pr="_reactListening"+Math.random().toString(36).slice(2);function $n(e){if(!e[pr]){e[pr]=!0,ss.forEach(function(n){n!=="selectionchange"&&(Xd.has(n)||Dl(n,!1,e),Dl(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[pr]||(t[pr]=!0,Dl("selectionchange",!1,t))}}function tu(e,t,n,r){switch(Ms(t)){case 1:var l=cd;break;case 4:l=dd;break;default:l=li}n=l.bind(null,t,n,e),l=void 0,!uo||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(l=!0),r?l!==void 0?e.addEventListener(t,n,{capture:!0,passive:l}):e.addEventListener(t,n,!0):l!==void 0?e.addEventListener(t,n,{passive:l}):e.addEventListener(t,n,!1)}function Ml(e,t,n,r,l){var o=r;if(!(t&1)&&!(t&2)&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var a=r.stateNode.containerInfo;if(a===l||a.nodeType===8&&a.parentNode===l)break;if(i===4)for(i=r.return;i!==null;){var s=i.tag;if((s===3||s===4)&&(s=i.stateNode.containerInfo,s===l||s.nodeType===8&&s.parentNode===l))return;i=i.return}for(;a!==null;){if(i=St(a),i===null)return;if(s=i.tag,s===5||s===6){r=o=i;continue e}a=a.parentNode}}r=r.return}Cs(function(){var f=o,v=ei(n),h=[];e:{var m=Js.get(e);if(m!==void 0){var x=ii,w=e;switch(e){case"keypress":if(Nr(n)===0)break e;case"keydown":case"keyup":x=jd;break;case"focusin":w="focus",x=Fl;break;case"focusout":w="blur",x=Fl;break;case"beforeblur":case"afterblur":x=Fl;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":x=ea;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":x=md;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":x=_d;break;case Ks:case Xs:case Zs:x=gd;break;case qs:x=Fd;break;case"scroll":x=fd;break;case"wheel":x=Rd;break;case"copy":case"cut":case"paste":x=yd;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":x=na}var k=(t&4)!==0,R=!k&&e==="scroll",d=k?m!==null?m+"Capture":null:m;k=[];for(var c=f,p;c!==null;){p=c;var g=p.stateNode;if(p.tag===5&&g!==null&&(p=g,d!==null&&(g=On(c,d),g!=null&&k.push(Vn(c,g,p)))),R)break;c=c.return}0<k.length&&(m=new x(m,w,null,n,v),h.push({event:m,listeners:k}))}}if(!(t&7)){e:{if(m=e==="mouseover"||e==="pointerover",x=e==="mouseout"||e==="pointerout",m&&n!==ao&&(w=n.relatedTarget||n.fromElement)&&(St(w)||w[Ge]))break e;if((x||m)&&(m=v.window===v?v:(m=v.ownerDocument)?m.defaultView||m.parentWindow:window,x?(w=n.relatedTarget||n.toElement,x=f,w=w?St(w):null,w!==null&&(R=Rt(w),w!==R||w.tag!==5&&w.tag!==6)&&(w=null)):(x=null,w=f),x!==w)){if(k=ea,g="onMouseLeave",d="onMouseEnter",c="mouse",(e==="pointerout"||e==="pointerover")&&(k=na,g="onPointerLeave",d="onPointerEnter",c="pointer"),R=x==null?m:Bt(x),p=w==null?m:Bt(w),m=new k(g,c+"leave",x,n,v),m.target=R,m.relatedTarget=p,g=null,St(v)===f&&(k=new k(d,c+"enter",w,n,v),k.target=p,k.relatedTarget=R,g=k),R=g,x&&w)t:{for(k=x,d=w,c=0,p=k;p;p=It(p))c++;for(p=0,g=d;g;g=It(g))p++;for(;0<c-p;)k=It(k),c--;for(;0<p-c;)d=It(d),p--;for(;c--;){if(k===d||d!==null&&k===d.alternate)break t;k=It(k),d=It(d)}k=null}else k=null;x!==null&&pa(h,m,x,k,!1),w!==null&&R!==null&&pa(h,R,w,k,!0)}}e:{if(m=f?Bt(f):window,x=m.nodeName&&m.nodeName.toLowerCase(),x==="select"||x==="input"&&m.type==="file")var S=bd;else if(oa(m))if(Ws)S=Wd;else{S=$d;var E=Bd}else(x=m.nodeName)&&x.toLowerCase()==="input"&&(m.type==="checkbox"||m.type==="radio")&&(S=Vd);if(S&&(S=S(e,f))){Vs(h,S,n,v);break e}E&&E(e,m,f),e==="focusout"&&(E=m._wrapperState)&&E.controlled&&m.type==="number"&&no(m,"number",m.value)}switch(E=f?Bt(f):window,e){case"focusin":(oa(E)||E.contentEditable==="true")&&(Ut=E,ho=f,_n=null);break;case"focusout":_n=ho=Ut=null;break;case"mousedown":vo=!0;break;case"contextmenu":case"mouseup":case"dragend":vo=!1,ca(h,n,v);break;case"selectionchange":if(Qd)break;case"keydown":case"keyup":ca(h,n,v)}var N;if(si)e:{switch(e){case"compositionstart":var z="onCompositionStart";break e;case"compositionend":z="onCompositionEnd";break e;case"compositionupdate":z="onCompositionUpdate";break e}z=void 0}else Mt?Bs(e,n)&&(z="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(z="onCompositionStart");z&&(bs&&n.locale!=="ko"&&(Mt||z!=="onCompositionStart"?z==="onCompositionEnd"&&Mt&&(N=Us()):(rt=v,oi="value"in rt?rt.value:rt.textContent,Mt=!0)),E=br(f,z),0<E.length&&(z=new ta(z,e,null,n,v),h.push({event:z,listeners:E}),N?z.data=N:(N=$s(n),N!==null&&(z.data=N)))),(N=Ad?Od(e,n):Dd(e,n))&&(f=br(f,"onBeforeInput"),0<f.length&&(v=new ta("onBeforeInput","beforeinput",null,n,v),h.push({event:v,listeners:f}),v.data=N))}eu(h,t)})}function Vn(e,t,n){return{instance:e,listener:t,currentTarget:n}}function br(e,t){for(var n=t+"Capture",r=[];e!==null;){var l=e,o=l.stateNode;l.tag===5&&o!==null&&(l=o,o=On(e,n),o!=null&&r.unshift(Vn(e,o,l)),o=On(e,t),o!=null&&r.push(Vn(e,o,l))),e=e.return}return r}function It(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function pa(e,t,n,r,l){for(var o=t._reactName,i=[];n!==null&&n!==r;){var a=n,s=a.alternate,f=a.stateNode;if(s!==null&&s===r)break;a.tag===5&&f!==null&&(a=f,l?(s=On(n,o),s!=null&&i.unshift(Vn(n,s,a))):l||(s=On(n,o),s!=null&&i.push(Vn(n,s,a)))),n=n.return}i.length!==0&&e.push({event:t,listeners:i})}var Zd=/\r\n?/g,qd=/\u0000|\uFFFD/g;function ma(e){return(typeof e=="string"?e:""+e).replace(Zd,`
`).replace(qd,"")}function mr(e,t,n){if(t=ma(t),ma(e)!==t&&n)throw Error(y(425))}function Br(){}var go=null,xo=null;function yo(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var wo=typeof setTimeout=="function"?setTimeout:void 0,Jd=typeof clearTimeout=="function"?clearTimeout:void 0,ha=typeof Promise=="function"?Promise:void 0,ef=typeof queueMicrotask=="function"?queueMicrotask:typeof ha<"u"?function(e){return ha.resolve(null).then(e).catch(tf)}:wo;function tf(e){setTimeout(function(){throw e})}function Ul(e,t){var n=t,r=0;do{var l=n.nextSibling;if(e.removeChild(n),l&&l.nodeType===8)if(n=l.data,n==="/$"){if(r===0){e.removeChild(l),Un(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=l}while(n);Un(t)}function st(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function va(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var cn=Math.random().toString(36).slice(2),Ue="__reactFiber$"+cn,Wn="__reactProps$"+cn,Ge="__reactContainer$"+cn,ko="__reactEvents$"+cn,nf="__reactListeners$"+cn,rf="__reactHandles$"+cn;function St(e){var t=e[Ue];if(t)return t;for(var n=e.parentNode;n;){if(t=n[Ge]||n[Ue]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=va(e);e!==null;){if(n=e[Ue])return n;e=va(e)}return t}e=n,n=e.parentNode}return null}function er(e){return e=e[Ue]||e[Ge],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Bt(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(y(33))}function ul(e){return e[Wn]||null}var So=[],$t=-1;function vt(e){return{current:e}}function U(e){0>$t||(e.current=So[$t],So[$t]=null,$t--)}function D(e,t){$t++,So[$t]=e.current,e.current=t}var mt={},ie=vt(mt),me=vt(!1),zt=mt;function tn(e,t){var n=e.type.contextTypes;if(!n)return mt;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var l={},o;for(o in n)l[o]=t[o];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=l),l}function he(e){return e=e.childContextTypes,e!=null}function $r(){U(me),U(ie)}function ga(e,t,n){if(ie.current!==mt)throw Error(y(168));D(ie,t),D(me,n)}function nu(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var l in r)if(!(l in t))throw Error(y(108,Bc(e)||"Unknown",l));return V({},n,r)}function Vr(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||mt,zt=ie.current,D(ie,e),D(me,me.current),!0}function xa(e,t,n){var r=e.stateNode;if(!r)throw Error(y(169));n?(e=nu(e,t,zt),r.__reactInternalMemoizedMergedChildContext=e,U(me),U(ie),D(ie,e)):U(me),D(me,n)}var Ve=null,cl=!1,bl=!1;function ru(e){Ve===null?Ve=[e]:Ve.push(e)}function lf(e){cl=!0,ru(e)}function gt(){if(!bl&&Ve!==null){bl=!0;var e=0,t=O;try{var n=Ve;for(O=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}Ve=null,cl=!1}catch(l){throw Ve!==null&&(Ve=Ve.slice(e+1)),Ls(ti,gt),l}finally{O=t,bl=!1}}return null}var Vt=[],Wt=0,Wr=null,Hr=0,Ee=[],Ce=0,Lt=null,We=1,He="";function wt(e,t){Vt[Wt++]=Hr,Vt[Wt++]=Wr,Wr=e,Hr=t}function lu(e,t,n){Ee[Ce++]=We,Ee[Ce++]=He,Ee[Ce++]=Lt,Lt=e;var r=We;e=He;var l=32-Re(r)-1;r&=~(1<<l),n+=1;var o=32-Re(t)+l;if(30<o){var i=l-l%5;o=(r&(1<<i)-1).toString(32),r>>=i,l-=i,We=1<<32-Re(t)+l|n<<l|r,He=o+e}else We=1<<o|n<<l|r,He=e}function ci(e){e.return!==null&&(wt(e,1),lu(e,1,0))}function di(e){for(;e===Wr;)Wr=Vt[--Wt],Vt[Wt]=null,Hr=Vt[--Wt],Vt[Wt]=null;for(;e===Lt;)Lt=Ee[--Ce],Ee[Ce]=null,He=Ee[--Ce],Ee[Ce]=null,We=Ee[--Ce],Ee[Ce]=null}var ye=null,xe=null,b=!1,Te=null;function ou(e,t){var n=Ne(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function ya(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,ye=e,xe=st(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,ye=e,xe=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=Lt!==null?{id:We,overflow:He}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Ne(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,ye=e,xe=null,!0):!1;default:return!1}}function Eo(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Co(e){if(b){var t=xe;if(t){var n=t;if(!ya(e,t)){if(Eo(e))throw Error(y(418));t=st(n.nextSibling);var r=ye;t&&ya(e,t)?ou(r,n):(e.flags=e.flags&-4097|2,b=!1,ye=e)}}else{if(Eo(e))throw Error(y(418));e.flags=e.flags&-4097|2,b=!1,ye=e}}}function wa(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;ye=e}function hr(e){if(e!==ye)return!1;if(!b)return wa(e),b=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!yo(e.type,e.memoizedProps)),t&&(t=xe)){if(Eo(e))throw iu(),Error(y(418));for(;t;)ou(e,t),t=st(t.nextSibling)}if(wa(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(y(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){xe=st(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}xe=null}}else xe=ye?st(e.stateNode.nextSibling):null;return!0}function iu(){for(var e=xe;e;)e=st(e.nextSibling)}function nn(){xe=ye=null,b=!1}function fi(e){Te===null?Te=[e]:Te.push(e)}var of=Ze.ReactCurrentBatchConfig;function xn(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(y(309));var r=n.stateNode}if(!r)throw Error(y(147,e));var l=r,o=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===o?t.ref:(t=function(i){var a=l.refs;i===null?delete a[o]:a[o]=i},t._stringRef=o,t)}if(typeof e!="string")throw Error(y(284));if(!n._owner)throw Error(y(290,e))}return e}function vr(e,t){throw e=Object.prototype.toString.call(t),Error(y(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function ka(e){var t=e._init;return t(e._payload)}function au(e){function t(d,c){if(e){var p=d.deletions;p===null?(d.deletions=[c],d.flags|=16):p.push(c)}}function n(d,c){if(!e)return null;for(;c!==null;)t(d,c),c=c.sibling;return null}function r(d,c){for(d=new Map;c!==null;)c.key!==null?d.set(c.key,c):d.set(c.index,c),c=c.sibling;return d}function l(d,c){return d=ft(d,c),d.index=0,d.sibling=null,d}function o(d,c,p){return d.index=p,e?(p=d.alternate,p!==null?(p=p.index,p<c?(d.flags|=2,c):p):(d.flags|=2,c)):(d.flags|=1048576,c)}function i(d){return e&&d.alternate===null&&(d.flags|=2),d}function a(d,c,p,g){return c===null||c.tag!==6?(c=Ql(p,d.mode,g),c.return=d,c):(c=l(c,p),c.return=d,c)}function s(d,c,p,g){var S=p.type;return S===Dt?v(d,c,p.props.children,g,p.key):c!==null&&(c.elementType===S||typeof S=="object"&&S!==null&&S.$$typeof===Je&&ka(S)===c.type)?(g=l(c,p.props),g.ref=xn(d,c,p),g.return=d,g):(g=Tr(p.type,p.key,p.props,null,d.mode,g),g.ref=xn(d,c,p),g.return=d,g)}function f(d,c,p,g){return c===null||c.tag!==4||c.stateNode.containerInfo!==p.containerInfo||c.stateNode.implementation!==p.implementation?(c=Gl(p,d.mode,g),c.return=d,c):(c=l(c,p.children||[]),c.return=d,c)}function v(d,c,p,g,S){return c===null||c.tag!==7?(c=jt(p,d.mode,g,S),c.return=d,c):(c=l(c,p),c.return=d,c)}function h(d,c,p){if(typeof c=="string"&&c!==""||typeof c=="number")return c=Ql(""+c,d.mode,p),c.return=d,c;if(typeof c=="object"&&c!==null){switch(c.$$typeof){case or:return p=Tr(c.type,c.key,c.props,null,d.mode,p),p.ref=xn(d,null,c),p.return=d,p;case Ot:return c=Gl(c,d.mode,p),c.return=d,c;case Je:var g=c._init;return h(d,g(c._payload),p)}if(Sn(c)||pn(c))return c=jt(c,d.mode,p,null),c.return=d,c;vr(d,c)}return null}function m(d,c,p,g){var S=c!==null?c.key:null;if(typeof p=="string"&&p!==""||typeof p=="number")return S!==null?null:a(d,c,""+p,g);if(typeof p=="object"&&p!==null){switch(p.$$typeof){case or:return p.key===S?s(d,c,p,g):null;case Ot:return p.key===S?f(d,c,p,g):null;case Je:return S=p._init,m(d,c,S(p._payload),g)}if(Sn(p)||pn(p))return S!==null?null:v(d,c,p,g,null);vr(d,p)}return null}function x(d,c,p,g,S){if(typeof g=="string"&&g!==""||typeof g=="number")return d=d.get(p)||null,a(c,d,""+g,S);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case or:return d=d.get(g.key===null?p:g.key)||null,s(c,d,g,S);case Ot:return d=d.get(g.key===null?p:g.key)||null,f(c,d,g,S);case Je:var E=g._init;return x(d,c,p,E(g._payload),S)}if(Sn(g)||pn(g))return d=d.get(p)||null,v(c,d,g,S,null);vr(c,g)}return null}function w(d,c,p,g){for(var S=null,E=null,N=c,z=c=0,A=null;N!==null&&z<p.length;z++){N.index>z?(A=N,N=null):A=N.sibling;var L=m(d,N,p[z],g);if(L===null){N===null&&(N=A);break}e&&N&&L.alternate===null&&t(d,N),c=o(L,c,z),E===null?S=L:E.sibling=L,E=L,N=A}if(z===p.length)return n(d,N),b&&wt(d,z),S;if(N===null){for(;z<p.length;z++)N=h(d,p[z],g),N!==null&&(c=o(N,c,z),E===null?S=N:E.sibling=N,E=N);return b&&wt(d,z),S}for(N=r(d,N);z<p.length;z++)A=x(N,d,z,p[z],g),A!==null&&(e&&A.alternate!==null&&N.delete(A.key===null?z:A.key),c=o(A,c,z),E===null?S=A:E.sibling=A,E=A);return e&&N.forEach(function(H){return t(d,H)}),b&&wt(d,z),S}function k(d,c,p,g){var S=pn(p);if(typeof S!="function")throw Error(y(150));if(p=S.call(p),p==null)throw Error(y(151));for(var E=S=null,N=c,z=c=0,A=null,L=p.next();N!==null&&!L.done;z++,L=p.next()){N.index>z?(A=N,N=null):A=N.sibling;var H=m(d,N,L.value,g);if(H===null){N===null&&(N=A);break}e&&N&&H.alternate===null&&t(d,N),c=o(H,c,z),E===null?S=H:E.sibling=H,E=H,N=A}if(L.done)return n(d,N),b&&wt(d,z),S;if(N===null){for(;!L.done;z++,L=p.next())L=h(d,L.value,g),L!==null&&(c=o(L,c,z),E===null?S=L:E.sibling=L,E=L);return b&&wt(d,z),S}for(N=r(d,N);!L.done;z++,L=p.next())L=x(N,d,z,L.value,g),L!==null&&(e&&L.alternate!==null&&N.delete(L.key===null?z:L.key),c=o(L,c,z),E===null?S=L:E.sibling=L,E=L);return e&&N.forEach(function(de){return t(d,de)}),b&&wt(d,z),S}function R(d,c,p,g){if(typeof p=="object"&&p!==null&&p.type===Dt&&p.key===null&&(p=p.props.children),typeof p=="object"&&p!==null){switch(p.$$typeof){case or:e:{for(var S=p.key,E=c;E!==null;){if(E.key===S){if(S=p.type,S===Dt){if(E.tag===7){n(d,E.sibling),c=l(E,p.props.children),c.return=d,d=c;break e}}else if(E.elementType===S||typeof S=="object"&&S!==null&&S.$$typeof===Je&&ka(S)===E.type){n(d,E.sibling),c=l(E,p.props),c.ref=xn(d,E,p),c.return=d,d=c;break e}n(d,E);break}else t(d,E);E=E.sibling}p.type===Dt?(c=jt(p.props.children,d.mode,g,p.key),c.return=d,d=c):(g=Tr(p.type,p.key,p.props,null,d.mode,g),g.ref=xn(d,c,p),g.return=d,d=g)}return i(d);case Ot:e:{for(E=p.key;c!==null;){if(c.key===E)if(c.tag===4&&c.stateNode.containerInfo===p.containerInfo&&c.stateNode.implementation===p.implementation){n(d,c.sibling),c=l(c,p.children||[]),c.return=d,d=c;break e}else{n(d,c);break}else t(d,c);c=c.sibling}c=Gl(p,d.mode,g),c.return=d,d=c}return i(d);case Je:return E=p._init,R(d,c,E(p._payload),g)}if(Sn(p))return w(d,c,p,g);if(pn(p))return k(d,c,p,g);vr(d,p)}return typeof p=="string"&&p!==""||typeof p=="number"?(p=""+p,c!==null&&c.tag===6?(n(d,c.sibling),c=l(c,p),c.return=d,d=c):(n(d,c),c=Ql(p,d.mode,g),c.return=d,d=c),i(d)):n(d,c)}return R}var rn=au(!0),su=au(!1),Yr=vt(null),Qr=null,Ht=null,pi=null;function mi(){pi=Ht=Qr=null}function hi(e){var t=Yr.current;U(Yr),e._currentValue=t}function No(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function qt(e,t){Qr=e,pi=Ht=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&t&&(pe=!0),e.firstContext=null)}function ze(e){var t=e._currentValue;if(pi!==e)if(e={context:e,memoizedValue:t,next:null},Ht===null){if(Qr===null)throw Error(y(308));Ht=e,Qr.dependencies={lanes:0,firstContext:e}}else Ht=Ht.next=e;return t}var Et=null;function vi(e){Et===null?Et=[e]:Et.push(e)}function uu(e,t,n,r){var l=t.interleaved;return l===null?(n.next=n,vi(t)):(n.next=l.next,l.next=n),t.interleaved=n,Ke(e,r)}function Ke(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var et=!1;function gi(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function cu(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function Ye(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function ut(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,I&2){var l=r.pending;return l===null?t.next=t:(t.next=l.next,l.next=t),r.pending=t,Ke(e,n)}return l=r.interleaved,l===null?(t.next=t,vi(r)):(t.next=l.next,l.next=t),r.interleaved=t,Ke(e,n)}function jr(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ni(e,n)}}function Sa(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var l=null,o=null;if(n=n.firstBaseUpdate,n!==null){do{var i={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};o===null?l=o=i:o=o.next=i,n=n.next}while(n!==null);o===null?l=o=t:o=o.next=t}else l=o=t;n={baseState:r.baseState,firstBaseUpdate:l,lastBaseUpdate:o,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function Gr(e,t,n,r){var l=e.updateQueue;et=!1;var o=l.firstBaseUpdate,i=l.lastBaseUpdate,a=l.shared.pending;if(a!==null){l.shared.pending=null;var s=a,f=s.next;s.next=null,i===null?o=f:i.next=f,i=s;var v=e.alternate;v!==null&&(v=v.updateQueue,a=v.lastBaseUpdate,a!==i&&(a===null?v.firstBaseUpdate=f:a.next=f,v.lastBaseUpdate=s))}if(o!==null){var h=l.baseState;i=0,v=f=s=null,a=o;do{var m=a.lane,x=a.eventTime;if((r&m)===m){v!==null&&(v=v.next={eventTime:x,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var w=e,k=a;switch(m=t,x=n,k.tag){case 1:if(w=k.payload,typeof w=="function"){h=w.call(x,h,m);break e}h=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=k.payload,m=typeof w=="function"?w.call(x,h,m):w,m==null)break e;h=V({},h,m);break e;case 2:et=!0}}a.callback!==null&&a.lane!==0&&(e.flags|=64,m=l.effects,m===null?l.effects=[a]:m.push(a))}else x={eventTime:x,lane:m,tag:a.tag,payload:a.payload,callback:a.callback,next:null},v===null?(f=v=x,s=h):v=v.next=x,i|=m;if(a=a.next,a===null){if(a=l.shared.pending,a===null)break;m=a,a=m.next,m.next=null,l.lastBaseUpdate=m,l.shared.pending=null}}while(!0);if(v===null&&(s=h),l.baseState=s,l.firstBaseUpdate=f,l.lastBaseUpdate=v,t=l.shared.interleaved,t!==null){l=t;do i|=l.lane,l=l.next;while(l!==t)}else o===null&&(l.shared.lanes=0);Pt|=i,e.lanes=i,e.memoizedState=h}}function Ea(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],l=r.callback;if(l!==null){if(r.callback=null,r=n,typeof l!="function")throw Error(y(191,l));l.call(r)}}}var tr={},Be=vt(tr),Hn=vt(tr),Yn=vt(tr);function Ct(e){if(e===tr)throw Error(y(174));return e}function xi(e,t){switch(D(Yn,t),D(Hn,e),D(Be,tr),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:lo(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=lo(t,e)}U(Be),D(Be,t)}function ln(){U(Be),U(Hn),U(Yn)}function du(e){Ct(Yn.current);var t=Ct(Be.current),n=lo(t,e.type);t!==n&&(D(Hn,e),D(Be,n))}function yi(e){Hn.current===e&&(U(Be),U(Hn))}var B=vt(0);function Kr(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Bl=[];function wi(){for(var e=0;e<Bl.length;e++)Bl[e]._workInProgressVersionPrimary=null;Bl.length=0}var zr=Ze.ReactCurrentDispatcher,$l=Ze.ReactCurrentBatchConfig,_t=0,$=null,K=null,q=null,Xr=!1,Pn=!1,Qn=0,af=0;function re(){throw Error(y(321))}function ki(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Ae(e[n],t[n]))return!1;return!0}function Si(e,t,n,r,l,o){if(_t=o,$=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,zr.current=e===null||e.memoizedState===null?df:ff,e=n(r,l),Pn){o=0;do{if(Pn=!1,Qn=0,25<=o)throw Error(y(301));o+=1,q=K=null,t.updateQueue=null,zr.current=pf,e=n(r,l)}while(Pn)}if(zr.current=Zr,t=K!==null&&K.next!==null,_t=0,q=K=$=null,Xr=!1,t)throw Error(y(300));return e}function Ei(){var e=Qn!==0;return Qn=0,e}function Me(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return q===null?$.memoizedState=q=e:q=q.next=e,q}function Le(){if(K===null){var e=$.alternate;e=e!==null?e.memoizedState:null}else e=K.next;var t=q===null?$.memoizedState:q.next;if(t!==null)q=t,K=e;else{if(e===null)throw Error(y(310));K=e,e={memoizedState:K.memoizedState,baseState:K.baseState,baseQueue:K.baseQueue,queue:K.queue,next:null},q===null?$.memoizedState=q=e:q=q.next=e}return q}function Gn(e,t){return typeof t=="function"?t(e):t}function Vl(e){var t=Le(),n=t.queue;if(n===null)throw Error(y(311));n.lastRenderedReducer=e;var r=K,l=r.baseQueue,o=n.pending;if(o!==null){if(l!==null){var i=l.next;l.next=o.next,o.next=i}r.baseQueue=l=o,n.pending=null}if(l!==null){o=l.next,r=r.baseState;var a=i=null,s=null,f=o;do{var v=f.lane;if((_t&v)===v)s!==null&&(s=s.next={lane:0,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null}),r=f.hasEagerState?f.eagerState:e(r,f.action);else{var h={lane:v,action:f.action,hasEagerState:f.hasEagerState,eagerState:f.eagerState,next:null};s===null?(a=s=h,i=r):s=s.next=h,$.lanes|=v,Pt|=v}f=f.next}while(f!==null&&f!==o);s===null?i=r:s.next=a,Ae(r,t.memoizedState)||(pe=!0),t.memoizedState=r,t.baseState=i,t.baseQueue=s,n.lastRenderedState=r}if(e=n.interleaved,e!==null){l=e;do o=l.lane,$.lanes|=o,Pt|=o,l=l.next;while(l!==e)}else l===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function Wl(e){var t=Le(),n=t.queue;if(n===null)throw Error(y(311));n.lastRenderedReducer=e;var r=n.dispatch,l=n.pending,o=t.memoizedState;if(l!==null){n.pending=null;var i=l=l.next;do o=e(o,i.action),i=i.next;while(i!==l);Ae(o,t.memoizedState)||(pe=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function fu(){}function pu(e,t){var n=$,r=Le(),l=t(),o=!Ae(r.memoizedState,l);if(o&&(r.memoizedState=l,pe=!0),r=r.queue,Ci(vu.bind(null,n,r,e),[e]),r.getSnapshot!==t||o||q!==null&&q.memoizedState.tag&1){if(n.flags|=2048,Kn(9,hu.bind(null,n,r,l,t),void 0,null),J===null)throw Error(y(349));_t&30||mu(n,t,l)}return l}function mu(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=$.updateQueue,t===null?(t={lastEffect:null,stores:null},$.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function hu(e,t,n,r){t.value=n,t.getSnapshot=r,gu(t)&&xu(e)}function vu(e,t,n){return n(function(){gu(t)&&xu(e)})}function gu(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Ae(e,n)}catch{return!0}}function xu(e){var t=Ke(e,1);t!==null&&Ie(t,e,1,-1)}function Ca(e){var t=Me();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Gn,lastRenderedState:e},t.queue=e,e=e.dispatch=cf.bind(null,$,e),[t.memoizedState,e]}function Kn(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=$.updateQueue,t===null?(t={lastEffect:null,stores:null},$.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function yu(){return Le().memoizedState}function Lr(e,t,n,r){var l=Me();$.flags|=e,l.memoizedState=Kn(1|t,n,void 0,r===void 0?null:r)}function dl(e,t,n,r){var l=Le();r=r===void 0?null:r;var o=void 0;if(K!==null){var i=K.memoizedState;if(o=i.destroy,r!==null&&ki(r,i.deps)){l.memoizedState=Kn(t,n,o,r);return}}$.flags|=e,l.memoizedState=Kn(1|t,n,o,r)}function Na(e,t){return Lr(8390656,8,e,t)}function Ci(e,t){return dl(2048,8,e,t)}function wu(e,t){return dl(4,2,e,t)}function ku(e,t){return dl(4,4,e,t)}function Su(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Eu(e,t,n){return n=n!=null?n.concat([e]):null,dl(4,4,Su.bind(null,t,e),n)}function Ni(){}function Cu(e,t){var n=Le();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ki(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Nu(e,t){var n=Le();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ki(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function ju(e,t,n){return _t&21?(Ae(n,t)||(n=Fs(),$.lanes|=n,Pt|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,pe=!0),e.memoizedState=n)}function sf(e,t){var n=O;O=n!==0&&4>n?n:4,e(!0);var r=$l.transition;$l.transition={};try{e(!1),t()}finally{O=n,$l.transition=r}}function zu(){return Le().memoizedState}function uf(e,t,n){var r=dt(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Lu(e))_u(t,n);else if(n=uu(e,t,n,r),n!==null){var l=se();Ie(n,e,r,l),Pu(n,t,r)}}function cf(e,t,n){var r=dt(e),l={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Lu(e))_u(t,l);else{var o=e.alternate;if(e.lanes===0&&(o===null||o.lanes===0)&&(o=t.lastRenderedReducer,o!==null))try{var i=t.lastRenderedState,a=o(i,n);if(l.hasEagerState=!0,l.eagerState=a,Ae(a,i)){var s=t.interleaved;s===null?(l.next=l,vi(t)):(l.next=s.next,s.next=l),t.interleaved=l;return}}catch{}finally{}n=uu(e,t,l,r),n!==null&&(l=se(),Ie(n,e,r,l),Pu(n,t,r))}}function Lu(e){var t=e.alternate;return e===$||t!==null&&t===$}function _u(e,t){Pn=Xr=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Pu(e,t,n){if(n&4194240){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ni(e,n)}}var Zr={readContext:ze,useCallback:re,useContext:re,useEffect:re,useImperativeHandle:re,useInsertionEffect:re,useLayoutEffect:re,useMemo:re,useReducer:re,useRef:re,useState:re,useDebugValue:re,useDeferredValue:re,useTransition:re,useMutableSource:re,useSyncExternalStore:re,useId:re,unstable_isNewReconciler:!1},df={readContext:ze,useCallback:function(e,t){return Me().memoizedState=[e,t===void 0?null:t],e},useContext:ze,useEffect:Na,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Lr(4194308,4,Su.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Lr(4194308,4,e,t)},useInsertionEffect:function(e,t){return Lr(4,2,e,t)},useMemo:function(e,t){var n=Me();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=Me();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=uf.bind(null,$,e),[r.memoizedState,e]},useRef:function(e){var t=Me();return e={current:e},t.memoizedState=e},useState:Ca,useDebugValue:Ni,useDeferredValue:function(e){return Me().memoizedState=e},useTransition:function(){var e=Ca(!1),t=e[0];return e=sf.bind(null,e[1]),Me().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=$,l=Me();if(b){if(n===void 0)throw Error(y(407));n=n()}else{if(n=t(),J===null)throw Error(y(349));_t&30||mu(r,t,n)}l.memoizedState=n;var o={value:n,getSnapshot:t};return l.queue=o,Na(vu.bind(null,r,o,e),[e]),r.flags|=2048,Kn(9,hu.bind(null,r,o,n,t),void 0,null),n},useId:function(){var e=Me(),t=J.identifierPrefix;if(b){var n=He,r=We;n=(r&~(1<<32-Re(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Qn++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=af++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},ff={readContext:ze,useCallback:Cu,useContext:ze,useEffect:Ci,useImperativeHandle:Eu,useInsertionEffect:wu,useLayoutEffect:ku,useMemo:Nu,useReducer:Vl,useRef:yu,useState:function(){return Vl(Gn)},useDebugValue:Ni,useDeferredValue:function(e){var t=Le();return ju(t,K.memoizedState,e)},useTransition:function(){var e=Vl(Gn)[0],t=Le().memoizedState;return[e,t]},useMutableSource:fu,useSyncExternalStore:pu,useId:zu,unstable_isNewReconciler:!1},pf={readContext:ze,useCallback:Cu,useContext:ze,useEffect:Ci,useImperativeHandle:Eu,useInsertionEffect:wu,useLayoutEffect:ku,useMemo:Nu,useReducer:Wl,useRef:yu,useState:function(){return Wl(Gn)},useDebugValue:Ni,useDeferredValue:function(e){var t=Le();return K===null?t.memoizedState=e:ju(t,K.memoizedState,e)},useTransition:function(){var e=Wl(Gn)[0],t=Le().memoizedState;return[e,t]},useMutableSource:fu,useSyncExternalStore:pu,useId:zu,unstable_isNewReconciler:!1};function Pe(e,t){if(e&&e.defaultProps){t=V({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function jo(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:V({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var fl={isMounted:function(e){return(e=e._reactInternals)?Rt(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=se(),l=dt(e),o=Ye(r,l);o.payload=t,n!=null&&(o.callback=n),t=ut(e,o,l),t!==null&&(Ie(t,e,l,r),jr(t,e,l))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=se(),l=dt(e),o=Ye(r,l);o.tag=1,o.payload=t,n!=null&&(o.callback=n),t=ut(e,o,l),t!==null&&(Ie(t,e,l,r),jr(t,e,l))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=se(),r=dt(e),l=Ye(n,r);l.tag=2,t!=null&&(l.callback=t),t=ut(e,l,r),t!==null&&(Ie(t,e,r,n),jr(t,e,r))}};function ja(e,t,n,r,l,o,i){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,o,i):t.prototype&&t.prototype.isPureReactComponent?!Bn(n,r)||!Bn(l,o):!0}function Fu(e,t,n){var r=!1,l=mt,o=t.contextType;return typeof o=="object"&&o!==null?o=ze(o):(l=he(t)?zt:ie.current,r=t.contextTypes,o=(r=r!=null)?tn(e,l):mt),t=new t(n,o),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=fl,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=l,e.__reactInternalMemoizedMaskedChildContext=o),t}function za(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&fl.enqueueReplaceState(t,t.state,null)}function zo(e,t,n,r){var l=e.stateNode;l.props=n,l.state=e.memoizedState,l.refs={},gi(e);var o=t.contextType;typeof o=="object"&&o!==null?l.context=ze(o):(o=he(t)?zt:ie.current,l.context=tn(e,o)),l.state=e.memoizedState,o=t.getDerivedStateFromProps,typeof o=="function"&&(jo(e,t,o,n),l.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(t=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),t!==l.state&&fl.enqueueReplaceState(l,l.state,null),Gr(e,n,l,r),l.state=e.memoizedState),typeof l.componentDidMount=="function"&&(e.flags|=4194308)}function on(e,t){try{var n="",r=t;do n+=bc(r),r=r.return;while(r);var l=n}catch(o){l=`
Error generating stack: `+o.message+`
`+o.stack}return{value:e,source:t,stack:l,digest:null}}function Hl(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function Lo(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var mf=typeof WeakMap=="function"?WeakMap:Map;function Tu(e,t,n){n=Ye(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){Jr||(Jr=!0,Mo=r),Lo(e,t)},n}function Ru(e,t,n){n=Ye(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var l=t.value;n.payload=function(){return r(l)},n.callback=function(){Lo(e,t)}}var o=e.stateNode;return o!==null&&typeof o.componentDidCatch=="function"&&(n.callback=function(){Lo(e,t),typeof r!="function"&&(ct===null?ct=new Set([this]):ct.add(this));var i=t.stack;this.componentDidCatch(t.value,{componentStack:i!==null?i:""})}),n}function La(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new mf;var l=new Set;r.set(t,l)}else l=r.get(t),l===void 0&&(l=new Set,r.set(t,l));l.has(n)||(l.add(n),e=Lf.bind(null,e,t,n),t.then(e,e))}function _a(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function Pa(e,t,n,r,l){return e.mode&1?(e.flags|=65536,e.lanes=l,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=Ye(-1,1),t.tag=2,ut(n,t,1))),n.lanes|=1),e)}var hf=Ze.ReactCurrentOwner,pe=!1;function ae(e,t,n,r){t.child=e===null?su(t,null,n,r):rn(t,e.child,n,r)}function Fa(e,t,n,r,l){n=n.render;var o=t.ref;return qt(t,l),r=Si(e,t,n,r,o,l),n=Ei(),e!==null&&!pe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l,Xe(e,t,l)):(b&&n&&ci(t),t.flags|=1,ae(e,t,r,l),t.child)}function Ta(e,t,n,r,l){if(e===null){var o=n.type;return typeof o=="function"&&!Ri(o)&&o.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=o,Iu(e,t,o,r,l)):(e=Tr(n.type,null,r,t,t.mode,l),e.ref=t.ref,e.return=t,t.child=e)}if(o=e.child,!(e.lanes&l)){var i=o.memoizedProps;if(n=n.compare,n=n!==null?n:Bn,n(i,r)&&e.ref===t.ref)return Xe(e,t,l)}return t.flags|=1,e=ft(o,r),e.ref=t.ref,e.return=t,t.child=e}function Iu(e,t,n,r,l){if(e!==null){var o=e.memoizedProps;if(Bn(o,r)&&e.ref===t.ref)if(pe=!1,t.pendingProps=r=o,(e.lanes&l)!==0)e.flags&131072&&(pe=!0);else return t.lanes=e.lanes,Xe(e,t,l)}return _o(e,t,n,r,l)}function Au(e,t,n){var r=t.pendingProps,l=r.children,o=e!==null?e.memoizedState:null;if(r.mode==="hidden")if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},D(Qt,ge),ge|=n;else{if(!(n&1073741824))return e=o!==null?o.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,D(Qt,ge),ge|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=o!==null?o.baseLanes:n,D(Qt,ge),ge|=r}else o!==null?(r=o.baseLanes|n,t.memoizedState=null):r=n,D(Qt,ge),ge|=r;return ae(e,t,l,n),t.child}function Ou(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function _o(e,t,n,r,l){var o=he(n)?zt:ie.current;return o=tn(t,o),qt(t,l),n=Si(e,t,n,r,o,l),r=Ei(),e!==null&&!pe?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l,Xe(e,t,l)):(b&&r&&ci(t),t.flags|=1,ae(e,t,n,l),t.child)}function Ra(e,t,n,r,l){if(he(n)){var o=!0;Vr(t)}else o=!1;if(qt(t,l),t.stateNode===null)_r(e,t),Fu(t,n,r),zo(t,n,r,l),r=!0;else if(e===null){var i=t.stateNode,a=t.memoizedProps;i.props=a;var s=i.context,f=n.contextType;typeof f=="object"&&f!==null?f=ze(f):(f=he(n)?zt:ie.current,f=tn(t,f));var v=n.getDerivedStateFromProps,h=typeof v=="function"||typeof i.getSnapshotBeforeUpdate=="function";h||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(a!==r||s!==f)&&za(t,i,r,f),et=!1;var m=t.memoizedState;i.state=m,Gr(t,r,i,l),s=t.memoizedState,a!==r||m!==s||me.current||et?(typeof v=="function"&&(jo(t,n,v,r),s=t.memoizedState),(a=et||ja(t,n,a,r,m,s,f))?(h||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(t.flags|=4194308)):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=s),i.props=r,i.state=s,i.context=f,r=a):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{i=t.stateNode,cu(e,t),a=t.memoizedProps,f=t.type===t.elementType?a:Pe(t.type,a),i.props=f,h=t.pendingProps,m=i.context,s=n.contextType,typeof s=="object"&&s!==null?s=ze(s):(s=he(n)?zt:ie.current,s=tn(t,s));var x=n.getDerivedStateFromProps;(v=typeof x=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(a!==h||m!==s)&&za(t,i,r,s),et=!1,m=t.memoizedState,i.state=m,Gr(t,r,i,l);var w=t.memoizedState;a!==h||m!==w||me.current||et?(typeof x=="function"&&(jo(t,n,x,r),w=t.memoizedState),(f=et||ja(t,n,f,r,m,w,s)||!1)?(v||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(r,w,s),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(r,w,s)),typeof i.componentDidUpdate=="function"&&(t.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof i.componentDidUpdate!="function"||a===e.memoizedProps&&m===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||a===e.memoizedProps&&m===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=w),i.props=r,i.state=w,i.context=s,r=f):(typeof i.componentDidUpdate!="function"||a===e.memoizedProps&&m===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||a===e.memoizedProps&&m===e.memoizedState||(t.flags|=1024),r=!1)}return Po(e,t,n,r,o,l)}function Po(e,t,n,r,l,o){Ou(e,t);var i=(t.flags&128)!==0;if(!r&&!i)return l&&xa(t,n,!1),Xe(e,t,o);r=t.stateNode,hf.current=t;var a=i&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&i?(t.child=rn(t,e.child,null,o),t.child=rn(t,null,a,o)):ae(e,t,a,o),t.memoizedState=r.state,l&&xa(t,n,!0),t.child}function Du(e){var t=e.stateNode;t.pendingContext?ga(e,t.pendingContext,t.pendingContext!==t.context):t.context&&ga(e,t.context,!1),xi(e,t.containerInfo)}function Ia(e,t,n,r,l){return nn(),fi(l),t.flags|=256,ae(e,t,n,r),t.child}var Fo={dehydrated:null,treeContext:null,retryLane:0};function To(e){return{baseLanes:e,cachePool:null,transitions:null}}function Mu(e,t,n){var r=t.pendingProps,l=B.current,o=!1,i=(t.flags&128)!==0,a;if((a=i)||(a=e!==null&&e.memoizedState===null?!1:(l&2)!==0),a?(o=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(l|=1),D(B,l&1),e===null)return Co(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.mode&1?e.data==="$!"?t.lanes=8:t.lanes=1073741824:t.lanes=1,null):(i=r.children,e=r.fallback,o?(r=t.mode,o=t.child,i={mode:"hidden",children:i},!(r&1)&&o!==null?(o.childLanes=0,o.pendingProps=i):o=hl(i,r,0,null),e=jt(e,r,n,null),o.return=t,e.return=t,o.sibling=e,t.child=o,t.child.memoizedState=To(n),t.memoizedState=Fo,e):ji(t,i));if(l=e.memoizedState,l!==null&&(a=l.dehydrated,a!==null))return vf(e,t,i,r,a,l,n);if(o){o=r.fallback,i=t.mode,l=e.child,a=l.sibling;var s={mode:"hidden",children:r.children};return!(i&1)&&t.child!==l?(r=t.child,r.childLanes=0,r.pendingProps=s,t.deletions=null):(r=ft(l,s),r.subtreeFlags=l.subtreeFlags&14680064),a!==null?o=ft(a,o):(o=jt(o,i,n,null),o.flags|=2),o.return=t,r.return=t,r.sibling=o,t.child=r,r=o,o=t.child,i=e.child.memoizedState,i=i===null?To(n):{baseLanes:i.baseLanes|n,cachePool:null,transitions:i.transitions},o.memoizedState=i,o.childLanes=e.childLanes&~n,t.memoizedState=Fo,r}return o=e.child,e=o.sibling,r=ft(o,{mode:"visible",children:r.children}),!(t.mode&1)&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function ji(e,t){return t=hl({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function gr(e,t,n,r){return r!==null&&fi(r),rn(t,e.child,null,n),e=ji(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function vf(e,t,n,r,l,o,i){if(n)return t.flags&256?(t.flags&=-257,r=Hl(Error(y(422))),gr(e,t,i,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(o=r.fallback,l=t.mode,r=hl({mode:"visible",children:r.children},l,0,null),o=jt(o,l,i,null),o.flags|=2,r.return=t,o.return=t,r.sibling=o,t.child=r,t.mode&1&&rn(t,e.child,null,i),t.child.memoizedState=To(i),t.memoizedState=Fo,o);if(!(t.mode&1))return gr(e,t,i,null);if(l.data==="$!"){if(r=l.nextSibling&&l.nextSibling.dataset,r)var a=r.dgst;return r=a,o=Error(y(419)),r=Hl(o,r,void 0),gr(e,t,i,r)}if(a=(i&e.childLanes)!==0,pe||a){if(r=J,r!==null){switch(i&-i){case 4:l=2;break;case 16:l=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:l=32;break;case 536870912:l=268435456;break;default:l=0}l=l&(r.suspendedLanes|i)?0:l,l!==0&&l!==o.retryLane&&(o.retryLane=l,Ke(e,l),Ie(r,e,l,-1))}return Ti(),r=Hl(Error(y(421))),gr(e,t,i,r)}return l.data==="$?"?(t.flags|=128,t.child=e.child,t=_f.bind(null,e),l._reactRetry=t,null):(e=o.treeContext,xe=st(l.nextSibling),ye=t,b=!0,Te=null,e!==null&&(Ee[Ce++]=We,Ee[Ce++]=He,Ee[Ce++]=Lt,We=e.id,He=e.overflow,Lt=t),t=ji(t,r.children),t.flags|=4096,t)}function Aa(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),No(e.return,t,n)}function Yl(e,t,n,r,l){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:l}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=l)}function Uu(e,t,n){var r=t.pendingProps,l=r.revealOrder,o=r.tail;if(ae(e,t,r.children,n),r=B.current,r&2)r=r&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Aa(e,n,t);else if(e.tag===19)Aa(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(D(B,r),!(t.mode&1))t.memoizedState=null;else switch(l){case"forwards":for(n=t.child,l=null;n!==null;)e=n.alternate,e!==null&&Kr(e)===null&&(l=n),n=n.sibling;n=l,n===null?(l=t.child,t.child=null):(l=n.sibling,n.sibling=null),Yl(t,!1,l,n,o);break;case"backwards":for(n=null,l=t.child,t.child=null;l!==null;){if(e=l.alternate,e!==null&&Kr(e)===null){t.child=l;break}e=l.sibling,l.sibling=n,n=l,l=e}Yl(t,!0,n,null,o);break;case"together":Yl(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function _r(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Xe(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Pt|=t.lanes,!(n&t.childLanes))return null;if(e!==null&&t.child!==e.child)throw Error(y(153));if(t.child!==null){for(e=t.child,n=ft(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=ft(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function gf(e,t,n){switch(t.tag){case 3:Du(t),nn();break;case 5:du(t);break;case 1:he(t.type)&&Vr(t);break;case 4:xi(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,l=t.memoizedProps.value;D(Yr,r._currentValue),r._currentValue=l;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(D(B,B.current&1),t.flags|=128,null):n&t.child.childLanes?Mu(e,t,n):(D(B,B.current&1),e=Xe(e,t,n),e!==null?e.sibling:null);D(B,B.current&1);break;case 19:if(r=(n&t.childLanes)!==0,e.flags&128){if(r)return Uu(e,t,n);t.flags|=128}if(l=t.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),D(B,B.current),r)break;return null;case 22:case 23:return t.lanes=0,Au(e,t,n)}return Xe(e,t,n)}var bu,Ro,Bu,$u;bu=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Ro=function(){};Bu=function(e,t,n,r){var l=e.memoizedProps;if(l!==r){e=t.stateNode,Ct(Be.current);var o=null;switch(n){case"input":l=eo(e,l),r=eo(e,r),o=[];break;case"select":l=V({},l,{value:void 0}),r=V({},r,{value:void 0}),o=[];break;case"textarea":l=ro(e,l),r=ro(e,r),o=[];break;default:typeof l.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=Br)}oo(n,r);var i;n=null;for(f in l)if(!r.hasOwnProperty(f)&&l.hasOwnProperty(f)&&l[f]!=null)if(f==="style"){var a=l[f];for(i in a)a.hasOwnProperty(i)&&(n||(n={}),n[i]="")}else f!=="dangerouslySetInnerHTML"&&f!=="children"&&f!=="suppressContentEditableWarning"&&f!=="suppressHydrationWarning"&&f!=="autoFocus"&&(In.hasOwnProperty(f)?o||(o=[]):(o=o||[]).push(f,null));for(f in r){var s=r[f];if(a=l!=null?l[f]:void 0,r.hasOwnProperty(f)&&s!==a&&(s!=null||a!=null))if(f==="style")if(a){for(i in a)!a.hasOwnProperty(i)||s&&s.hasOwnProperty(i)||(n||(n={}),n[i]="");for(i in s)s.hasOwnProperty(i)&&a[i]!==s[i]&&(n||(n={}),n[i]=s[i])}else n||(o||(o=[]),o.push(f,n)),n=s;else f==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,a=a?a.__html:void 0,s!=null&&a!==s&&(o=o||[]).push(f,s)):f==="children"?typeof s!="string"&&typeof s!="number"||(o=o||[]).push(f,""+s):f!=="suppressContentEditableWarning"&&f!=="suppressHydrationWarning"&&(In.hasOwnProperty(f)?(s!=null&&f==="onScroll"&&M("scroll",e),o||a===s||(o=[])):(o=o||[]).push(f,s))}n&&(o=o||[]).push("style",n);var f=o;(t.updateQueue=f)&&(t.flags|=4)}};$u=function(e,t,n,r){n!==r&&(t.flags|=4)};function yn(e,t){if(!b)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function le(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var l=e.child;l!==null;)n|=l.lanes|l.childLanes,r|=l.subtreeFlags&14680064,r|=l.flags&14680064,l.return=e,l=l.sibling;else for(l=e.child;l!==null;)n|=l.lanes|l.childLanes,r|=l.subtreeFlags,r|=l.flags,l.return=e,l=l.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function xf(e,t,n){var r=t.pendingProps;switch(di(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return le(t),null;case 1:return he(t.type)&&$r(),le(t),null;case 3:return r=t.stateNode,ln(),U(me),U(ie),wi(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(hr(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Te!==null&&(Bo(Te),Te=null))),Ro(e,t),le(t),null;case 5:yi(t);var l=Ct(Yn.current);if(n=t.type,e!==null&&t.stateNode!=null)Bu(e,t,n,r,l),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(y(166));return le(t),null}if(e=Ct(Be.current),hr(t)){r=t.stateNode,n=t.type;var o=t.memoizedProps;switch(r[Ue]=t,r[Wn]=o,e=(t.mode&1)!==0,n){case"dialog":M("cancel",r),M("close",r);break;case"iframe":case"object":case"embed":M("load",r);break;case"video":case"audio":for(l=0;l<Cn.length;l++)M(Cn[l],r);break;case"source":M("error",r);break;case"img":case"image":case"link":M("error",r),M("load",r);break;case"details":M("toggle",r);break;case"input":Wi(r,o),M("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!o.multiple},M("invalid",r);break;case"textarea":Yi(r,o),M("invalid",r)}oo(n,o),l=null;for(var i in o)if(o.hasOwnProperty(i)){var a=o[i];i==="children"?typeof a=="string"?r.textContent!==a&&(o.suppressHydrationWarning!==!0&&mr(r.textContent,a,e),l=["children",a]):typeof a=="number"&&r.textContent!==""+a&&(o.suppressHydrationWarning!==!0&&mr(r.textContent,a,e),l=["children",""+a]):In.hasOwnProperty(i)&&a!=null&&i==="onScroll"&&M("scroll",r)}switch(n){case"input":ir(r),Hi(r,o,!0);break;case"textarea":ir(r),Qi(r);break;case"select":case"option":break;default:typeof o.onClick=="function"&&(r.onclick=Br)}r=l,t.updateQueue=r,r!==null&&(t.flags|=4)}else{i=l.nodeType===9?l:l.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=vs(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=i.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=i.createElement(n,{is:r.is}):(e=i.createElement(n),n==="select"&&(i=e,r.multiple?i.multiple=!0:r.size&&(i.size=r.size))):e=i.createElementNS(e,n),e[Ue]=t,e[Wn]=r,bu(e,t,!1,!1),t.stateNode=e;e:{switch(i=io(n,r),n){case"dialog":M("cancel",e),M("close",e),l=r;break;case"iframe":case"object":case"embed":M("load",e),l=r;break;case"video":case"audio":for(l=0;l<Cn.length;l++)M(Cn[l],e);l=r;break;case"source":M("error",e),l=r;break;case"img":case"image":case"link":M("error",e),M("load",e),l=r;break;case"details":M("toggle",e),l=r;break;case"input":Wi(e,r),l=eo(e,r),M("invalid",e);break;case"option":l=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},l=V({},r,{value:void 0}),M("invalid",e);break;case"textarea":Yi(e,r),l=ro(e,r),M("invalid",e);break;default:l=r}oo(n,l),a=l;for(o in a)if(a.hasOwnProperty(o)){var s=a[o];o==="style"?ys(e,s):o==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,s!=null&&gs(e,s)):o==="children"?typeof s=="string"?(n!=="textarea"||s!=="")&&An(e,s):typeof s=="number"&&An(e,""+s):o!=="suppressContentEditableWarning"&&o!=="suppressHydrationWarning"&&o!=="autoFocus"&&(In.hasOwnProperty(o)?s!=null&&o==="onScroll"&&M("scroll",e):s!=null&&Xo(e,o,s,i))}switch(n){case"input":ir(e),Hi(e,r,!1);break;case"textarea":ir(e),Qi(e);break;case"option":r.value!=null&&e.setAttribute("value",""+pt(r.value));break;case"select":e.multiple=!!r.multiple,o=r.value,o!=null?Gt(e,!!r.multiple,o,!1):r.defaultValue!=null&&Gt(e,!!r.multiple,r.defaultValue,!0);break;default:typeof l.onClick=="function"&&(e.onclick=Br)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return le(t),null;case 6:if(e&&t.stateNode!=null)$u(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(y(166));if(n=Ct(Yn.current),Ct(Be.current),hr(t)){if(r=t.stateNode,n=t.memoizedProps,r[Ue]=t,(o=r.nodeValue!==n)&&(e=ye,e!==null))switch(e.tag){case 3:mr(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&mr(r.nodeValue,n,(e.mode&1)!==0)}o&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[Ue]=t,t.stateNode=r}return le(t),null;case 13:if(U(B),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(b&&xe!==null&&t.mode&1&&!(t.flags&128))iu(),nn(),t.flags|=98560,o=!1;else if(o=hr(t),r!==null&&r.dehydrated!==null){if(e===null){if(!o)throw Error(y(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(y(317));o[Ue]=t}else nn(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;le(t),o=!1}else Te!==null&&(Bo(Te),Te=null),o=!0;if(!o)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,t.mode&1&&(e===null||B.current&1?X===0&&(X=3):Ti())),t.updateQueue!==null&&(t.flags|=4),le(t),null);case 4:return ln(),Ro(e,t),e===null&&$n(t.stateNode.containerInfo),le(t),null;case 10:return hi(t.type._context),le(t),null;case 17:return he(t.type)&&$r(),le(t),null;case 19:if(U(B),o=t.memoizedState,o===null)return le(t),null;if(r=(t.flags&128)!==0,i=o.rendering,i===null)if(r)yn(o,!1);else{if(X!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(i=Kr(e),i!==null){for(t.flags|=128,yn(o,!1),r=i.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)o=n,e=r,o.flags&=14680066,i=o.alternate,i===null?(o.childLanes=0,o.lanes=e,o.child=null,o.subtreeFlags=0,o.memoizedProps=null,o.memoizedState=null,o.updateQueue=null,o.dependencies=null,o.stateNode=null):(o.childLanes=i.childLanes,o.lanes=i.lanes,o.child=i.child,o.subtreeFlags=0,o.deletions=null,o.memoizedProps=i.memoizedProps,o.memoizedState=i.memoizedState,o.updateQueue=i.updateQueue,o.type=i.type,e=i.dependencies,o.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return D(B,B.current&1|2),t.child}e=e.sibling}o.tail!==null&&Q()>an&&(t.flags|=128,r=!0,yn(o,!1),t.lanes=4194304)}else{if(!r)if(e=Kr(i),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),yn(o,!0),o.tail===null&&o.tailMode==="hidden"&&!i.alternate&&!b)return le(t),null}else 2*Q()-o.renderingStartTime>an&&n!==1073741824&&(t.flags|=128,r=!0,yn(o,!1),t.lanes=4194304);o.isBackwards?(i.sibling=t.child,t.child=i):(n=o.last,n!==null?n.sibling=i:t.child=i,o.last=i)}return o.tail!==null?(t=o.tail,o.rendering=t,o.tail=t.sibling,o.renderingStartTime=Q(),t.sibling=null,n=B.current,D(B,r?n&1|2:n&1),t):(le(t),null);case 22:case 23:return Fi(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&t.mode&1?ge&1073741824&&(le(t),t.subtreeFlags&6&&(t.flags|=8192)):le(t),null;case 24:return null;case 25:return null}throw Error(y(156,t.tag))}function yf(e,t){switch(di(t),t.tag){case 1:return he(t.type)&&$r(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return ln(),U(me),U(ie),wi(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return yi(t),null;case 13:if(U(B),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(y(340));nn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return U(B),null;case 4:return ln(),null;case 10:return hi(t.type._context),null;case 22:case 23:return Fi(),null;case 24:return null;default:return null}}var xr=!1,oe=!1,wf=typeof WeakSet=="function"?WeakSet:Set,C=null;function Yt(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){W(e,t,r)}else n.current=null}function Io(e,t,n){try{n()}catch(r){W(e,t,r)}}var Oa=!1;function kf(e,t){if(go=Mr,e=Qs(),ui(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var l=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break e}var i=0,a=-1,s=-1,f=0,v=0,h=e,m=null;t:for(;;){for(var x;h!==n||l!==0&&h.nodeType!==3||(a=i+l),h!==o||r!==0&&h.nodeType!==3||(s=i+r),h.nodeType===3&&(i+=h.nodeValue.length),(x=h.firstChild)!==null;)m=h,h=x;for(;;){if(h===e)break t;if(m===n&&++f===l&&(a=i),m===o&&++v===r&&(s=i),(x=h.nextSibling)!==null)break;h=m,m=h.parentNode}h=x}n=a===-1||s===-1?null:{start:a,end:s}}else n=null}n=n||{start:0,end:0}}else n=null;for(xo={focusedElem:e,selectionRange:n},Mr=!1,C=t;C!==null;)if(t=C,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,C=e;else for(;C!==null;){t=C;try{var w=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(w!==null){var k=w.memoizedProps,R=w.memoizedState,d=t.stateNode,c=d.getSnapshotBeforeUpdate(t.elementType===t.type?k:Pe(t.type,k),R);d.__reactInternalSnapshotBeforeUpdate=c}break;case 3:var p=t.stateNode.containerInfo;p.nodeType===1?p.textContent="":p.nodeType===9&&p.documentElement&&p.removeChild(p.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(y(163))}}catch(g){W(t,t.return,g)}if(e=t.sibling,e!==null){e.return=t.return,C=e;break}C=t.return}return w=Oa,Oa=!1,w}function Fn(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var l=r=r.next;do{if((l.tag&e)===e){var o=l.destroy;l.destroy=void 0,o!==void 0&&Io(t,n,o)}l=l.next}while(l!==r)}}function pl(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function Ao(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function Vu(e){var t=e.alternate;t!==null&&(e.alternate=null,Vu(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[Ue],delete t[Wn],delete t[ko],delete t[nf],delete t[rf])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Wu(e){return e.tag===5||e.tag===3||e.tag===4}function Da(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Wu(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Oo(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=Br));else if(r!==4&&(e=e.child,e!==null))for(Oo(e,t,n),e=e.sibling;e!==null;)Oo(e,t,n),e=e.sibling}function Do(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(Do(e,t,n),e=e.sibling;e!==null;)Do(e,t,n),e=e.sibling}var ee=null,Fe=!1;function qe(e,t,n){for(n=n.child;n!==null;)Hu(e,t,n),n=n.sibling}function Hu(e,t,n){if(be&&typeof be.onCommitFiberUnmount=="function")try{be.onCommitFiberUnmount(ol,n)}catch{}switch(n.tag){case 5:oe||Yt(n,t);case 6:var r=ee,l=Fe;ee=null,qe(e,t,n),ee=r,Fe=l,ee!==null&&(Fe?(e=ee,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):ee.removeChild(n.stateNode));break;case 18:ee!==null&&(Fe?(e=ee,n=n.stateNode,e.nodeType===8?Ul(e.parentNode,n):e.nodeType===1&&Ul(e,n),Un(e)):Ul(ee,n.stateNode));break;case 4:r=ee,l=Fe,ee=n.stateNode.containerInfo,Fe=!0,qe(e,t,n),ee=r,Fe=l;break;case 0:case 11:case 14:case 15:if(!oe&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){l=r=r.next;do{var o=l,i=o.destroy;o=o.tag,i!==void 0&&(o&2||o&4)&&Io(n,t,i),l=l.next}while(l!==r)}qe(e,t,n);break;case 1:if(!oe&&(Yt(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(a){W(n,t,a)}qe(e,t,n);break;case 21:qe(e,t,n);break;case 22:n.mode&1?(oe=(r=oe)||n.memoizedState!==null,qe(e,t,n),oe=r):qe(e,t,n);break;default:qe(e,t,n)}}function Ma(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new wf),t.forEach(function(r){var l=Pf.bind(null,e,r);n.has(r)||(n.add(r),r.then(l,l))})}}function _e(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var l=n[r];try{var o=e,i=t,a=i;e:for(;a!==null;){switch(a.tag){case 5:ee=a.stateNode,Fe=!1;break e;case 3:ee=a.stateNode.containerInfo,Fe=!0;break e;case 4:ee=a.stateNode.containerInfo,Fe=!0;break e}a=a.return}if(ee===null)throw Error(y(160));Hu(o,i,l),ee=null,Fe=!1;var s=l.alternate;s!==null&&(s.return=null),l.return=null}catch(f){W(l,t,f)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Yu(t,e),t=t.sibling}function Yu(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(_e(t,e),De(e),r&4){try{Fn(3,e,e.return),pl(3,e)}catch(k){W(e,e.return,k)}try{Fn(5,e,e.return)}catch(k){W(e,e.return,k)}}break;case 1:_e(t,e),De(e),r&512&&n!==null&&Yt(n,n.return);break;case 5:if(_e(t,e),De(e),r&512&&n!==null&&Yt(n,n.return),e.flags&32){var l=e.stateNode;try{An(l,"")}catch(k){W(e,e.return,k)}}if(r&4&&(l=e.stateNode,l!=null)){var o=e.memoizedProps,i=n!==null?n.memoizedProps:o,a=e.type,s=e.updateQueue;if(e.updateQueue=null,s!==null)try{a==="input"&&o.type==="radio"&&o.name!=null&&ms(l,o),io(a,i);var f=io(a,o);for(i=0;i<s.length;i+=2){var v=s[i],h=s[i+1];v==="style"?ys(l,h):v==="dangerouslySetInnerHTML"?gs(l,h):v==="children"?An(l,h):Xo(l,v,h,f)}switch(a){case"input":to(l,o);break;case"textarea":hs(l,o);break;case"select":var m=l._wrapperState.wasMultiple;l._wrapperState.wasMultiple=!!o.multiple;var x=o.value;x!=null?Gt(l,!!o.multiple,x,!1):m!==!!o.multiple&&(o.defaultValue!=null?Gt(l,!!o.multiple,o.defaultValue,!0):Gt(l,!!o.multiple,o.multiple?[]:"",!1))}l[Wn]=o}catch(k){W(e,e.return,k)}}break;case 6:if(_e(t,e),De(e),r&4){if(e.stateNode===null)throw Error(y(162));l=e.stateNode,o=e.memoizedProps;try{l.nodeValue=o}catch(k){W(e,e.return,k)}}break;case 3:if(_e(t,e),De(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Un(t.containerInfo)}catch(k){W(e,e.return,k)}break;case 4:_e(t,e),De(e);break;case 13:_e(t,e),De(e),l=e.child,l.flags&8192&&(o=l.memoizedState!==null,l.stateNode.isHidden=o,!o||l.alternate!==null&&l.alternate.memoizedState!==null||(_i=Q())),r&4&&Ma(e);break;case 22:if(v=n!==null&&n.memoizedState!==null,e.mode&1?(oe=(f=oe)||v,_e(t,e),oe=f):_e(t,e),De(e),r&8192){if(f=e.memoizedState!==null,(e.stateNode.isHidden=f)&&!v&&e.mode&1)for(C=e,v=e.child;v!==null;){for(h=C=v;C!==null;){switch(m=C,x=m.child,m.tag){case 0:case 11:case 14:case 15:Fn(4,m,m.return);break;case 1:Yt(m,m.return);var w=m.stateNode;if(typeof w.componentWillUnmount=="function"){r=m,n=m.return;try{t=r,w.props=t.memoizedProps,w.state=t.memoizedState,w.componentWillUnmount()}catch(k){W(r,n,k)}}break;case 5:Yt(m,m.return);break;case 22:if(m.memoizedState!==null){ba(h);continue}}x!==null?(x.return=m,C=x):ba(h)}v=v.sibling}e:for(v=null,h=e;;){if(h.tag===5){if(v===null){v=h;try{l=h.stateNode,f?(o=l.style,typeof o.setProperty=="function"?o.setProperty("display","none","important"):o.display="none"):(a=h.stateNode,s=h.memoizedProps.style,i=s!=null&&s.hasOwnProperty("display")?s.display:null,a.style.display=xs("display",i))}catch(k){W(e,e.return,k)}}}else if(h.tag===6){if(v===null)try{h.stateNode.nodeValue=f?"":h.memoizedProps}catch(k){W(e,e.return,k)}}else if((h.tag!==22&&h.tag!==23||h.memoizedState===null||h===e)&&h.child!==null){h.child.return=h,h=h.child;continue}if(h===e)break e;for(;h.sibling===null;){if(h.return===null||h.return===e)break e;v===h&&(v=null),h=h.return}v===h&&(v=null),h.sibling.return=h.return,h=h.sibling}}break;case 19:_e(t,e),De(e),r&4&&Ma(e);break;case 21:break;default:_e(t,e),De(e)}}function De(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Wu(n)){var r=n;break e}n=n.return}throw Error(y(160))}switch(r.tag){case 5:var l=r.stateNode;r.flags&32&&(An(l,""),r.flags&=-33);var o=Da(e);Do(e,o,l);break;case 3:case 4:var i=r.stateNode.containerInfo,a=Da(e);Oo(e,a,i);break;default:throw Error(y(161))}}catch(s){W(e,e.return,s)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Sf(e,t,n){C=e,Qu(e)}function Qu(e,t,n){for(var r=(e.mode&1)!==0;C!==null;){var l=C,o=l.child;if(l.tag===22&&r){var i=l.memoizedState!==null||xr;if(!i){var a=l.alternate,s=a!==null&&a.memoizedState!==null||oe;a=xr;var f=oe;if(xr=i,(oe=s)&&!f)for(C=l;C!==null;)i=C,s=i.child,i.tag===22&&i.memoizedState!==null?Ba(l):s!==null?(s.return=i,C=s):Ba(l);for(;o!==null;)C=o,Qu(o),o=o.sibling;C=l,xr=a,oe=f}Ua(e)}else l.subtreeFlags&8772&&o!==null?(o.return=l,C=o):Ua(e)}}function Ua(e){for(;C!==null;){var t=C;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:oe||pl(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!oe)if(n===null)r.componentDidMount();else{var l=t.elementType===t.type?n.memoizedProps:Pe(t.type,n.memoizedProps);r.componentDidUpdate(l,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var o=t.updateQueue;o!==null&&Ea(t,o,r);break;case 3:var i=t.updateQueue;if(i!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}Ea(t,i,n)}break;case 5:var a=t.stateNode;if(n===null&&t.flags&4){n=a;var s=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":s.autoFocus&&n.focus();break;case"img":s.src&&(n.src=s.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var f=t.alternate;if(f!==null){var v=f.memoizedState;if(v!==null){var h=v.dehydrated;h!==null&&Un(h)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(y(163))}oe||t.flags&512&&Ao(t)}catch(m){W(t,t.return,m)}}if(t===e){C=null;break}if(n=t.sibling,n!==null){n.return=t.return,C=n;break}C=t.return}}function ba(e){for(;C!==null;){var t=C;if(t===e){C=null;break}var n=t.sibling;if(n!==null){n.return=t.return,C=n;break}C=t.return}}function Ba(e){for(;C!==null;){var t=C;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{pl(4,t)}catch(s){W(t,n,s)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var l=t.return;try{r.componentDidMount()}catch(s){W(t,l,s)}}var o=t.return;try{Ao(t)}catch(s){W(t,o,s)}break;case 5:var i=t.return;try{Ao(t)}catch(s){W(t,i,s)}}}catch(s){W(t,t.return,s)}if(t===e){C=null;break}var a=t.sibling;if(a!==null){a.return=t.return,C=a;break}C=t.return}}var Ef=Math.ceil,qr=Ze.ReactCurrentDispatcher,zi=Ze.ReactCurrentOwner,je=Ze.ReactCurrentBatchConfig,I=0,J=null,G=null,te=0,ge=0,Qt=vt(0),X=0,Xn=null,Pt=0,ml=0,Li=0,Tn=null,fe=null,_i=0,an=1/0,$e=null,Jr=!1,Mo=null,ct=null,yr=!1,lt=null,el=0,Rn=0,Uo=null,Pr=-1,Fr=0;function se(){return I&6?Q():Pr!==-1?Pr:Pr=Q()}function dt(e){return e.mode&1?I&2&&te!==0?te&-te:of.transition!==null?(Fr===0&&(Fr=Fs()),Fr):(e=O,e!==0||(e=window.event,e=e===void 0?16:Ms(e.type)),e):1}function Ie(e,t,n,r){if(50<Rn)throw Rn=0,Uo=null,Error(y(185));qn(e,n,r),(!(I&2)||e!==J)&&(e===J&&(!(I&2)&&(ml|=n),X===4&&nt(e,te)),ve(e,r),n===1&&I===0&&!(t.mode&1)&&(an=Q()+500,cl&&gt()))}function ve(e,t){var n=e.callbackNode;od(e,t);var r=Dr(e,e===J?te:0);if(r===0)n!==null&&Xi(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&Xi(n),t===1)e.tag===0?lf($a.bind(null,e)):ru($a.bind(null,e)),ef(function(){!(I&6)&&gt()}),n=null;else{switch(Ts(r)){case 1:n=ti;break;case 4:n=_s;break;case 16:n=Or;break;case 536870912:n=Ps;break;default:n=Or}n=tc(n,Gu.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function Gu(e,t){if(Pr=-1,Fr=0,I&6)throw Error(y(327));var n=e.callbackNode;if(Jt()&&e.callbackNode!==n)return null;var r=Dr(e,e===J?te:0);if(r===0)return null;if(r&30||r&e.expiredLanes||t)t=tl(e,r);else{t=r;var l=I;I|=2;var o=Xu();(J!==e||te!==t)&&($e=null,an=Q()+500,Nt(e,t));do try{jf();break}catch(a){Ku(e,a)}while(!0);mi(),qr.current=o,I=l,G!==null?t=0:(J=null,te=0,t=X)}if(t!==0){if(t===2&&(l=fo(e),l!==0&&(r=l,t=bo(e,l))),t===1)throw n=Xn,Nt(e,0),nt(e,r),ve(e,Q()),n;if(t===6)nt(e,r);else{if(l=e.current.alternate,!(r&30)&&!Cf(l)&&(t=tl(e,r),t===2&&(o=fo(e),o!==0&&(r=o,t=bo(e,o))),t===1))throw n=Xn,Nt(e,0),nt(e,r),ve(e,Q()),n;switch(e.finishedWork=l,e.finishedLanes=r,t){case 0:case 1:throw Error(y(345));case 2:kt(e,fe,$e);break;case 3:if(nt(e,r),(r&130023424)===r&&(t=_i+500-Q(),10<t)){if(Dr(e,0)!==0)break;if(l=e.suspendedLanes,(l&r)!==r){se(),e.pingedLanes|=e.suspendedLanes&l;break}e.timeoutHandle=wo(kt.bind(null,e,fe,$e),t);break}kt(e,fe,$e);break;case 4:if(nt(e,r),(r&4194240)===r)break;for(t=e.eventTimes,l=-1;0<r;){var i=31-Re(r);o=1<<i,i=t[i],i>l&&(l=i),r&=~o}if(r=l,r=Q()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Ef(r/1960))-r,10<r){e.timeoutHandle=wo(kt.bind(null,e,fe,$e),r);break}kt(e,fe,$e);break;case 5:kt(e,fe,$e);break;default:throw Error(y(329))}}}return ve(e,Q()),e.callbackNode===n?Gu.bind(null,e):null}function bo(e,t){var n=Tn;return e.current.memoizedState.isDehydrated&&(Nt(e,t).flags|=256),e=tl(e,t),e!==2&&(t=fe,fe=n,t!==null&&Bo(t)),e}function Bo(e){fe===null?fe=e:fe.push.apply(fe,e)}function Cf(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var l=n[r],o=l.getSnapshot;l=l.value;try{if(!Ae(o(),l))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function nt(e,t){for(t&=~Li,t&=~ml,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-Re(t),r=1<<n;e[n]=-1,t&=~r}}function $a(e){if(I&6)throw Error(y(327));Jt();var t=Dr(e,0);if(!(t&1))return ve(e,Q()),null;var n=tl(e,t);if(e.tag!==0&&n===2){var r=fo(e);r!==0&&(t=r,n=bo(e,r))}if(n===1)throw n=Xn,Nt(e,0),nt(e,t),ve(e,Q()),n;if(n===6)throw Error(y(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,kt(e,fe,$e),ve(e,Q()),null}function Pi(e,t){var n=I;I|=1;try{return e(t)}finally{I=n,I===0&&(an=Q()+500,cl&&gt())}}function Ft(e){lt!==null&&lt.tag===0&&!(I&6)&&Jt();var t=I;I|=1;var n=je.transition,r=O;try{if(je.transition=null,O=1,e)return e()}finally{O=r,je.transition=n,I=t,!(I&6)&&gt()}}function Fi(){ge=Qt.current,U(Qt)}function Nt(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,Jd(n)),G!==null)for(n=G.return;n!==null;){var r=n;switch(di(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&$r();break;case 3:ln(),U(me),U(ie),wi();break;case 5:yi(r);break;case 4:ln();break;case 13:U(B);break;case 19:U(B);break;case 10:hi(r.type._context);break;case 22:case 23:Fi()}n=n.return}if(J=e,G=e=ft(e.current,null),te=ge=t,X=0,Xn=null,Li=ml=Pt=0,fe=Tn=null,Et!==null){for(t=0;t<Et.length;t++)if(n=Et[t],r=n.interleaved,r!==null){n.interleaved=null;var l=r.next,o=n.pending;if(o!==null){var i=o.next;o.next=l,r.next=i}n.pending=r}Et=null}return e}function Ku(e,t){do{var n=G;try{if(mi(),zr.current=Zr,Xr){for(var r=$.memoizedState;r!==null;){var l=r.queue;l!==null&&(l.pending=null),r=r.next}Xr=!1}if(_t=0,q=K=$=null,Pn=!1,Qn=0,zi.current=null,n===null||n.return===null){X=1,Xn=t,G=null;break}e:{var o=e,i=n.return,a=n,s=t;if(t=te,a.flags|=32768,s!==null&&typeof s=="object"&&typeof s.then=="function"){var f=s,v=a,h=v.tag;if(!(v.mode&1)&&(h===0||h===11||h===15)){var m=v.alternate;m?(v.updateQueue=m.updateQueue,v.memoizedState=m.memoizedState,v.lanes=m.lanes):(v.updateQueue=null,v.memoizedState=null)}var x=_a(i);if(x!==null){x.flags&=-257,Pa(x,i,a,o,t),x.mode&1&&La(o,f,t),t=x,s=f;var w=t.updateQueue;if(w===null){var k=new Set;k.add(s),t.updateQueue=k}else w.add(s);break e}else{if(!(t&1)){La(o,f,t),Ti();break e}s=Error(y(426))}}else if(b&&a.mode&1){var R=_a(i);if(R!==null){!(R.flags&65536)&&(R.flags|=256),Pa(R,i,a,o,t),fi(on(s,a));break e}}o=s=on(s,a),X!==4&&(X=2),Tn===null?Tn=[o]:Tn.push(o),o=i;do{switch(o.tag){case 3:o.flags|=65536,t&=-t,o.lanes|=t;var d=Tu(o,s,t);Sa(o,d);break e;case 1:a=s;var c=o.type,p=o.stateNode;if(!(o.flags&128)&&(typeof c.getDerivedStateFromError=="function"||p!==null&&typeof p.componentDidCatch=="function"&&(ct===null||!ct.has(p)))){o.flags|=65536,t&=-t,o.lanes|=t;var g=Ru(o,a,t);Sa(o,g);break e}}o=o.return}while(o!==null)}qu(n)}catch(S){t=S,G===n&&n!==null&&(G=n=n.return);continue}break}while(!0)}function Xu(){var e=qr.current;return qr.current=Zr,e===null?Zr:e}function Ti(){(X===0||X===3||X===2)&&(X=4),J===null||!(Pt&268435455)&&!(ml&268435455)||nt(J,te)}function tl(e,t){var n=I;I|=2;var r=Xu();(J!==e||te!==t)&&($e=null,Nt(e,t));do try{Nf();break}catch(l){Ku(e,l)}while(!0);if(mi(),I=n,qr.current=r,G!==null)throw Error(y(261));return J=null,te=0,X}function Nf(){for(;G!==null;)Zu(G)}function jf(){for(;G!==null&&!Xc();)Zu(G)}function Zu(e){var t=ec(e.alternate,e,ge);e.memoizedProps=e.pendingProps,t===null?qu(e):G=t,zi.current=null}function qu(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=yf(n,t),n!==null){n.flags&=32767,G=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{X=6,G=null;return}}else if(n=xf(n,t,ge),n!==null){G=n;return}if(t=t.sibling,t!==null){G=t;return}G=t=e}while(t!==null);X===0&&(X=5)}function kt(e,t,n){var r=O,l=je.transition;try{je.transition=null,O=1,zf(e,t,n,r)}finally{je.transition=l,O=r}return null}function zf(e,t,n,r){do Jt();while(lt!==null);if(I&6)throw Error(y(327));n=e.finishedWork;var l=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(y(177));e.callbackNode=null,e.callbackPriority=0;var o=n.lanes|n.childLanes;if(id(e,o),e===J&&(G=J=null,te=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||yr||(yr=!0,tc(Or,function(){return Jt(),null})),o=(n.flags&15990)!==0,n.subtreeFlags&15990||o){o=je.transition,je.transition=null;var i=O;O=1;var a=I;I|=4,zi.current=null,kf(e,n),Yu(n,e),Yd(xo),Mr=!!go,xo=go=null,e.current=n,Sf(n),Zc(),I=a,O=i,je.transition=o}else e.current=n;if(yr&&(yr=!1,lt=e,el=l),o=e.pendingLanes,o===0&&(ct=null),ed(n.stateNode),ve(e,Q()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)l=t[n],r(l.value,{componentStack:l.stack,digest:l.digest});if(Jr)throw Jr=!1,e=Mo,Mo=null,e;return el&1&&e.tag!==0&&Jt(),o=e.pendingLanes,o&1?e===Uo?Rn++:(Rn=0,Uo=e):Rn=0,gt(),null}function Jt(){if(lt!==null){var e=Ts(el),t=je.transition,n=O;try{if(je.transition=null,O=16>e?16:e,lt===null)var r=!1;else{if(e=lt,lt=null,el=0,I&6)throw Error(y(331));var l=I;for(I|=4,C=e.current;C!==null;){var o=C,i=o.child;if(C.flags&16){var a=o.deletions;if(a!==null){for(var s=0;s<a.length;s++){var f=a[s];for(C=f;C!==null;){var v=C;switch(v.tag){case 0:case 11:case 15:Fn(8,v,o)}var h=v.child;if(h!==null)h.return=v,C=h;else for(;C!==null;){v=C;var m=v.sibling,x=v.return;if(Vu(v),v===f){C=null;break}if(m!==null){m.return=x,C=m;break}C=x}}}var w=o.alternate;if(w!==null){var k=w.child;if(k!==null){w.child=null;do{var R=k.sibling;k.sibling=null,k=R}while(k!==null)}}C=o}}if(o.subtreeFlags&2064&&i!==null)i.return=o,C=i;else e:for(;C!==null;){if(o=C,o.flags&2048)switch(o.tag){case 0:case 11:case 15:Fn(9,o,o.return)}var d=o.sibling;if(d!==null){d.return=o.return,C=d;break e}C=o.return}}var c=e.current;for(C=c;C!==null;){i=C;var p=i.child;if(i.subtreeFlags&2064&&p!==null)p.return=i,C=p;else e:for(i=c;C!==null;){if(a=C,a.flags&2048)try{switch(a.tag){case 0:case 11:case 15:pl(9,a)}}catch(S){W(a,a.return,S)}if(a===i){C=null;break e}var g=a.sibling;if(g!==null){g.return=a.return,C=g;break e}C=a.return}}if(I=l,gt(),be&&typeof be.onPostCommitFiberRoot=="function")try{be.onPostCommitFiberRoot(ol,e)}catch{}r=!0}return r}finally{O=n,je.transition=t}}return!1}function Va(e,t,n){t=on(n,t),t=Tu(e,t,1),e=ut(e,t,1),t=se(),e!==null&&(qn(e,1,t),ve(e,t))}function W(e,t,n){if(e.tag===3)Va(e,e,n);else for(;t!==null;){if(t.tag===3){Va(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(ct===null||!ct.has(r))){e=on(n,e),e=Ru(t,e,1),t=ut(t,e,1),e=se(),t!==null&&(qn(t,1,e),ve(t,e));break}}t=t.return}}function Lf(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=se(),e.pingedLanes|=e.suspendedLanes&n,J===e&&(te&n)===n&&(X===4||X===3&&(te&130023424)===te&&500>Q()-_i?Nt(e,0):Li|=n),ve(e,t)}function Ju(e,t){t===0&&(e.mode&1?(t=ur,ur<<=1,!(ur&130023424)&&(ur=4194304)):t=1);var n=se();e=Ke(e,t),e!==null&&(qn(e,t,n),ve(e,n))}function _f(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Ju(e,n)}function Pf(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,l=e.memoizedState;l!==null&&(n=l.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(y(314))}r!==null&&r.delete(t),Ju(e,n)}var ec;ec=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||me.current)pe=!0;else{if(!(e.lanes&n)&&!(t.flags&128))return pe=!1,gf(e,t,n);pe=!!(e.flags&131072)}else pe=!1,b&&t.flags&1048576&&lu(t,Hr,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;_r(e,t),e=t.pendingProps;var l=tn(t,ie.current);qt(t,n),l=Si(null,t,r,e,l,n);var o=Ei();return t.flags|=1,typeof l=="object"&&l!==null&&typeof l.render=="function"&&l.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,he(r)?(o=!0,Vr(t)):o=!1,t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,gi(t),l.updater=fl,t.stateNode=l,l._reactInternals=t,zo(t,r,e,n),t=Po(null,t,r,!0,o,n)):(t.tag=0,b&&o&&ci(t),ae(null,t,l,n),t=t.child),t;case 16:r=t.elementType;e:{switch(_r(e,t),e=t.pendingProps,l=r._init,r=l(r._payload),t.type=r,l=t.tag=Tf(r),e=Pe(r,e),l){case 0:t=_o(null,t,r,e,n);break e;case 1:t=Ra(null,t,r,e,n);break e;case 11:t=Fa(null,t,r,e,n);break e;case 14:t=Ta(null,t,r,Pe(r.type,e),n);break e}throw Error(y(306,r,""))}return t;case 0:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:Pe(r,l),_o(e,t,r,l,n);case 1:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:Pe(r,l),Ra(e,t,r,l,n);case 3:e:{if(Du(t),e===null)throw Error(y(387));r=t.pendingProps,o=t.memoizedState,l=o.element,cu(e,t),Gr(t,r,null,n);var i=t.memoizedState;if(r=i.element,o.isDehydrated)if(o={element:r,isDehydrated:!1,cache:i.cache,pendingSuspenseBoundaries:i.pendingSuspenseBoundaries,transitions:i.transitions},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){l=on(Error(y(423)),t),t=Ia(e,t,r,n,l);break e}else if(r!==l){l=on(Error(y(424)),t),t=Ia(e,t,r,n,l);break e}else for(xe=st(t.stateNode.containerInfo.firstChild),ye=t,b=!0,Te=null,n=su(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(nn(),r===l){t=Xe(e,t,n);break e}ae(e,t,r,n)}t=t.child}return t;case 5:return du(t),e===null&&Co(t),r=t.type,l=t.pendingProps,o=e!==null?e.memoizedProps:null,i=l.children,yo(r,l)?i=null:o!==null&&yo(r,o)&&(t.flags|=32),Ou(e,t),ae(e,t,i,n),t.child;case 6:return e===null&&Co(t),null;case 13:return Mu(e,t,n);case 4:return xi(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=rn(t,null,r,n):ae(e,t,r,n),t.child;case 11:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:Pe(r,l),Fa(e,t,r,l,n);case 7:return ae(e,t,t.pendingProps,n),t.child;case 8:return ae(e,t,t.pendingProps.children,n),t.child;case 12:return ae(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,l=t.pendingProps,o=t.memoizedProps,i=l.value,D(Yr,r._currentValue),r._currentValue=i,o!==null)if(Ae(o.value,i)){if(o.children===l.children&&!me.current){t=Xe(e,t,n);break e}}else for(o=t.child,o!==null&&(o.return=t);o!==null;){var a=o.dependencies;if(a!==null){i=o.child;for(var s=a.firstContext;s!==null;){if(s.context===r){if(o.tag===1){s=Ye(-1,n&-n),s.tag=2;var f=o.updateQueue;if(f!==null){f=f.shared;var v=f.pending;v===null?s.next=s:(s.next=v.next,v.next=s),f.pending=s}}o.lanes|=n,s=o.alternate,s!==null&&(s.lanes|=n),No(o.return,n,t),a.lanes|=n;break}s=s.next}}else if(o.tag===10)i=o.type===t.type?null:o.child;else if(o.tag===18){if(i=o.return,i===null)throw Error(y(341));i.lanes|=n,a=i.alternate,a!==null&&(a.lanes|=n),No(i,n,t),i=o.sibling}else i=o.child;if(i!==null)i.return=o;else for(i=o;i!==null;){if(i===t){i=null;break}if(o=i.sibling,o!==null){o.return=i.return,i=o;break}i=i.return}o=i}ae(e,t,l.children,n),t=t.child}return t;case 9:return l=t.type,r=t.pendingProps.children,qt(t,n),l=ze(l),r=r(l),t.flags|=1,ae(e,t,r,n),t.child;case 14:return r=t.type,l=Pe(r,t.pendingProps),l=Pe(r.type,l),Ta(e,t,r,l,n);case 15:return Iu(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:Pe(r,l),_r(e,t),t.tag=1,he(r)?(e=!0,Vr(t)):e=!1,qt(t,n),Fu(t,r,l),zo(t,r,l,n),Po(null,t,r,!0,e,n);case 19:return Uu(e,t,n);case 22:return Au(e,t,n)}throw Error(y(156,t.tag))};function tc(e,t){return Ls(e,t)}function Ff(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ne(e,t,n,r){return new Ff(e,t,n,r)}function Ri(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Tf(e){if(typeof e=="function")return Ri(e)?1:0;if(e!=null){if(e=e.$$typeof,e===qo)return 11;if(e===Jo)return 14}return 2}function ft(e,t){var n=e.alternate;return n===null?(n=Ne(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Tr(e,t,n,r,l,o){var i=2;if(r=e,typeof e=="function")Ri(e)&&(i=1);else if(typeof e=="string")i=5;else e:switch(e){case Dt:return jt(n.children,l,o,t);case Zo:i=8,l|=8;break;case Xl:return e=Ne(12,n,t,l|2),e.elementType=Xl,e.lanes=o,e;case Zl:return e=Ne(13,n,t,l),e.elementType=Zl,e.lanes=o,e;case ql:return e=Ne(19,n,t,l),e.elementType=ql,e.lanes=o,e;case ds:return hl(n,l,o,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case us:i=10;break e;case cs:i=9;break e;case qo:i=11;break e;case Jo:i=14;break e;case Je:i=16,r=null;break e}throw Error(y(130,e==null?e:typeof e,""))}return t=Ne(i,n,t,l),t.elementType=e,t.type=r,t.lanes=o,t}function jt(e,t,n,r){return e=Ne(7,e,r,t),e.lanes=n,e}function hl(e,t,n,r){return e=Ne(22,e,r,t),e.elementType=ds,e.lanes=n,e.stateNode={isHidden:!1},e}function Ql(e,t,n){return e=Ne(6,e,null,t),e.lanes=n,e}function Gl(e,t,n){return t=Ne(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function Rf(e,t,n,r,l){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Ll(0),this.expirationTimes=Ll(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ll(0),this.identifierPrefix=r,this.onRecoverableError=l,this.mutableSourceEagerHydrationData=null}function Ii(e,t,n,r,l,o,i,a,s){return e=new Rf(e,t,n,a,s),t===1?(t=1,o===!0&&(t|=8)):t=0,o=Ne(3,null,null,t),e.current=o,o.stateNode=e,o.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},gi(o),e}function If(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:Ot,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function nc(e){if(!e)return mt;e=e._reactInternals;e:{if(Rt(e)!==e||e.tag!==1)throw Error(y(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(he(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(y(171))}if(e.tag===1){var n=e.type;if(he(n))return nu(e,n,t)}return t}function rc(e,t,n,r,l,o,i,a,s){return e=Ii(n,r,!0,e,l,o,i,a,s),e.context=nc(null),n=e.current,r=se(),l=dt(n),o=Ye(r,l),o.callback=t??null,ut(n,o,l),e.current.lanes=l,qn(e,l,r),ve(e,r),e}function vl(e,t,n,r){var l=t.current,o=se(),i=dt(l);return n=nc(n),t.context===null?t.context=n:t.pendingContext=n,t=Ye(o,i),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=ut(l,t,i),e!==null&&(Ie(e,l,i,o),jr(e,l,i)),i}function nl(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Wa(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Ai(e,t){Wa(e,t),(e=e.alternate)&&Wa(e,t)}function Af(){return null}var lc=typeof reportError=="function"?reportError:function(e){console.error(e)};function Oi(e){this._internalRoot=e}gl.prototype.render=Oi.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(y(409));vl(e,t,null,null)};gl.prototype.unmount=Oi.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Ft(function(){vl(null,e,null,null)}),t[Ge]=null}};function gl(e){this._internalRoot=e}gl.prototype.unstable_scheduleHydration=function(e){if(e){var t=As();e={blockedOn:null,target:e,priority:t};for(var n=0;n<tt.length&&t!==0&&t<tt[n].priority;n++);tt.splice(n,0,e),n===0&&Ds(e)}};function Di(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function xl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Ha(){}function Of(e,t,n,r,l){if(l){if(typeof r=="function"){var o=r;r=function(){var f=nl(i);o.call(f)}}var i=rc(t,r,e,0,null,!1,!1,"",Ha);return e._reactRootContainer=i,e[Ge]=i.current,$n(e.nodeType===8?e.parentNode:e),Ft(),i}for(;l=e.lastChild;)e.removeChild(l);if(typeof r=="function"){var a=r;r=function(){var f=nl(s);a.call(f)}}var s=Ii(e,0,!1,null,null,!1,!1,"",Ha);return e._reactRootContainer=s,e[Ge]=s.current,$n(e.nodeType===8?e.parentNode:e),Ft(function(){vl(t,s,n,r)}),s}function yl(e,t,n,r,l){var o=n._reactRootContainer;if(o){var i=o;if(typeof l=="function"){var a=l;l=function(){var s=nl(i);a.call(s)}}vl(t,i,e,l)}else i=Of(n,t,e,l,r);return nl(i)}Rs=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=En(t.pendingLanes);n!==0&&(ni(t,n|1),ve(t,Q()),!(I&6)&&(an=Q()+500,gt()))}break;case 13:Ft(function(){var r=Ke(e,1);if(r!==null){var l=se();Ie(r,e,1,l)}}),Ai(e,1)}};ri=function(e){if(e.tag===13){var t=Ke(e,134217728);if(t!==null){var n=se();Ie(t,e,134217728,n)}Ai(e,134217728)}};Is=function(e){if(e.tag===13){var t=dt(e),n=Ke(e,t);if(n!==null){var r=se();Ie(n,e,t,r)}Ai(e,t)}};As=function(){return O};Os=function(e,t){var n=O;try{return O=e,t()}finally{O=n}};so=function(e,t,n){switch(t){case"input":if(to(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var l=ul(r);if(!l)throw Error(y(90));ps(r),to(r,l)}}}break;case"textarea":hs(e,n);break;case"select":t=n.value,t!=null&&Gt(e,!!n.multiple,t,!1)}};Ss=Pi;Es=Ft;var Df={usingClientEntryPoint:!1,Events:[er,Bt,ul,ws,ks,Pi]},wn={findFiberByHostInstance:St,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Mf={bundleType:wn.bundleType,version:wn.version,rendererPackageName:wn.rendererPackageName,rendererConfig:wn.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Ze.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=js(e),e===null?null:e.stateNode},findFiberByHostInstance:wn.findFiberByHostInstance||Af,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var wr=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!wr.isDisabled&&wr.supportsFiber)try{ol=wr.inject(Mf),be=wr}catch{}}ke.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Df;ke.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Di(t))throw Error(y(200));return If(e,t,null,n)};ke.createRoot=function(e,t){if(!Di(e))throw Error(y(299));var n=!1,r="",l=lc;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(l=t.onRecoverableError)),t=Ii(e,1,!1,null,null,n,!1,r,l),e[Ge]=t.current,$n(e.nodeType===8?e.parentNode:e),new Oi(t)};ke.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(y(188)):(e=Object.keys(e).join(","),Error(y(268,e)));return e=js(t),e=e===null?null:e.stateNode,e};ke.flushSync=function(e){return Ft(e)};ke.hydrate=function(e,t,n){if(!xl(t))throw Error(y(200));return yl(null,e,t,!0,n)};ke.hydrateRoot=function(e,t,n){if(!Di(e))throw Error(y(405));var r=n!=null&&n.hydratedSources||null,l=!1,o="",i=lc;if(n!=null&&(n.unstable_strictMode===!0&&(l=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onRecoverableError!==void 0&&(i=n.onRecoverableError)),t=rc(t,null,e,1,n??null,l,!1,o,i),e[Ge]=t.current,$n(e),r)for(e=0;e<r.length;e++)n=r[e],l=n._getVersion,l=l(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,l]:t.mutableSourceEagerHydrationData.push(n,l);return new gl(t)};ke.render=function(e,t,n){if(!xl(t))throw Error(y(200));return yl(null,e,t,!1,n)};ke.unmountComponentAtNode=function(e){if(!xl(e))throw Error(y(40));return e._reactRootContainer?(Ft(function(){yl(null,null,e,!1,function(){e._reactRootContainer=null,e[Ge]=null})}),!0):!1};ke.unstable_batchedUpdates=Pi;ke.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!xl(n))throw Error(y(200));if(e==null||e._reactInternals===void 0)throw Error(y(38));return yl(e,t,n,!1,r)};ke.version="18.3.1-next-f1338f8080-20240426";function oc(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(oc)}catch(e){console.error(e)}}oc(),os.exports=ke;var Uf=os.exports,ic,Ya=Uf;ic=Ya.createRoot,Ya.hydrateRoot;const Qa=["#C8412B","#1F7A6B","#F2B23D","#E85C2A","#3FBA9A","#8B5CF6","#F472B6","#60A5FA","#34D399","#FB923C","#A78BFA","#2DD4BF","#E879F9","#F87171","#22D3EE"],At=3,$o=15,Vo=[{id:"animals",title:"الحيوانات",emoji:"🦁",words:["القط","الكلب","الحصان","الحمار","الدجاجة","الأرنب","السلحفاة","الثعبان","التمساح","الزرافة","الفيل","القرد","الدب","الثعلب","البطريق","البومة","النحلة","الفراشة","الحوت","الدلفين","القرش","الجمل","الغزال","الكنغر","الباندا","الأسد","النمر","الذئب","النسر","العنكبوت"]},{id:"food",title:"الماكلة",emoji:"🍲",words:["الحريرة","الطاجين","الكُسْكُس","المسمن","البغرير","البريوات","الشباكية","البِصّارة","الطنجية","الرفيسة","المروزية","السفنج","الكحك","الفشار","البيتزا","الساندويتش","الشاي","القهوة","العصير","الكوك","البرتقال","التفاح","البطيخ","الموز","الشاورما"]},{id:"home",title:"حوايج الدار",emoji:"🏠",words:["الكرسي","الطاولة","التلفاز","الثلاجة","الفرن","المفتاح","الساعة","المظلة","الحذاء","التاج","القبعة","النظارة","المقص","الغسالة","السرير","الوسادة","البطانية","النافذة","الباب","السلم","البالون","السلة","الملعقة","الطاس","إبريق الشاي"]},{id:"places",title:"الأماكن",emoji:"🏞️",words:["الشاطئ","الجبل","الغابة","البحر","المطار","المحطة","الجامعة","المدرسة","المستشفى","السوق","المول","الجامع","الحديقة","المسبح","الملعب","الطريق","الجسر","النهر","البرج","الصحراء","الواحة","المدينة","الحي","القرية","الميناء"]},{id:"objects",title:"حوايج خرى",emoji:"🎒",words:["الهاتف","اللابتوب","النظارة","الساعة","المظلة","الكتاب","القلم","الكرة","الطائرة الورقية","الصندوق","السيف","الدرع","السفينة","القطار","الطائرة","السيارة","الدراجة","الطوبيس","الكاميرا","الميكروفون","المطرقة","المفتاح","القفل","الشمعة","المرآة"]},{id:"nature",title:"الطبيعة",emoji:"🌦️",words:["الشمس","القمر","النجم","الغيمة","المطر","الثلج","البرق","قوس قزح","الشجرة","الوردة","الزهرة","العشب","الكهف","البركان","الزلزال","النار","الماء","المحيط","الجزيرة","الكوكب","الصحراء","الجبل","النهر","الريح","الصاعقة"]},{id:"school",title:"المدرسة",emoji:"📚",words:["الأستاذ","التلميذ","الامتحان","السبورة","القلم","الدفتر","المحفظة","المكتبة","الجدول","العطلة","الفناء","الغشاش","الكرسي","الطبشور","المنبه","الرسمة","الخريطة","المسطرة","الحقيبة","الممحاة"]},{id:"sports",title:"الرياضة",emoji:"⚽",words:["كرة القدم","كرة السلة","السباحة","الجري","التنس","الملاكمة","الدراجة","التزلج","الغوص","القفز","الجودو","رفع الأثقال","الجمناستيك","كرة الطائرة","كرة اليد","الغولف","البيسبول","الكريكيت","ركوب الخيل","التزلج على الجليد"]}];function ac(){return Vo[Math.floor(Math.random()*Vo.length)]}function bf(e){return e.words[Math.floor(Math.random()*e.words.length)]}function Bf(e,t){if(t===null)return e[Math.floor(Math.random()*e.length)];const n=e.filter(r=>r!==t);return n[Math.floor(Math.random()*n.length)]}function rl(e){const t=[...e];for(let n=t.length-1;n>0;n--){const r=Math.floor(Math.random()*(n+1)),l=t[n];t[n]=t[r],t[r]=l}return t}function $f(e,t){const n=e.words.filter(o=>o!==t),l=[...rl(n).slice(0,4),t];return rl(l)}function Vf(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4)}function sc(){return{phase:"setup",players:[],category:null,secretWord:null,imposterId:null,revealOrder:[],revealIndex:0,drawOrder:[],drawIndex:0,strokes:[],votes:[],votingIndex:0,drawnPlayerIds:[],guessedWords:null,guessCorrect:null,imposterCaught:null,lastImposterId:null,scores:{},roundNumber:1}}function uc(e){if(e.players.length<At)return e;const t=e.category??ac(),n=bf(t),r=e.players.map(a=>a.id),l=Bf(r,e.lastImposterId),o=$f(t,n),i={...e.scores};for(const a of r)a in i||(i[a]=0);return{...e,phase:"roleReveal",category:t,secretWord:n,imposterId:l,guessedWords:o,revealOrder:rl(r),revealIndex:0,drawOrder:rl(r),drawIndex:0,strokes:[],votes:[],votingIndex:0,drawnPlayerIds:[],guessCorrect:null,imposterCaught:null,scores:i}}function Wf(e){return e.revealIndex+1>=e.revealOrder.length?{...e,phase:"drawing"}:{...e,revealIndex:e.revealIndex+1}}function Hf(e){const t=(e.drawIndex+1)%e.drawOrder.length;return{...e,drawIndex:t}}function Yf(e,t,n){const r=e.votes.filter(o=>o.voterId!==t),l={voterId:t,targetId:n};return{...e,votes:[...r,l]}}function Qf(e){const t=e.votingIndex+1;return t>=e.players.length?cc(e):{...e,votingIndex:t}}function cc(e){if(e.phase!=="voting")return e;const t=new Map;for(const i of e.votes)t.set(i.targetId,(t.get(i.targetId)??0)+1);const n=t.get(e.imposterId??"")??0,r=Math.max(0,...t.values()),l=n===r&&r>0,o={...e.scores};if(l)for(const i of e.votes)i.targetId===e.imposterId&&(o[i.voterId]=(o[i.voterId]??0)+1);return{...e,phase:"resolution",imposterCaught:l,scores:o}}function Gf(e,t){const n=t===e.secretWord,r={...e.scores};return n&&e.imposterId&&(r[e.imposterId]=(r[e.imposterId]??0)+1),{...e,guessCorrect:n,scores:r}}function Kf(e){return{...uc(e),roundNumber:e.roundNumber+1}}function Xf(e,t){switch(t.type){case"ADD_PLAYER":{if(e.players.length>=$o)return e;const n=t.name.trim();if(!n||e.players.some(l=>l.name===n))return e;const r={id:Vf(),name:n,color:Qa[e.players.length%Qa.length]};return{...e,players:[...e.players,r]}}case"REMOVE_PLAYER":return{...e,players:e.players.filter(n=>n.id!==t.id)};case"UPDATE_PLAYER":return{...e,players:e.players.map(n=>n.id===t.id?{...n,name:t.name}:n)};case"SELECT_CATEGORY":return{...e,category:t.category};case"START_GAME":return uc(e);case"ADVANCE_REVEAL":return Wf(e);case"COMMIT_STROKE":{const n=e.drawOrder[e.drawIndex],r=e.drawnPlayerIds.includes(n)?e.drawnPlayerIds:[...e.drawnPlayerIds,n];return{...e,strokes:[...e.strokes,t.stroke],drawnPlayerIds:r}}case"NEXT_DRAWER":return Hf(e);case"GO_TO_VOTING":return{...e,phase:"voting",votingIndex:0,votes:[]};case"CAST_VOTE":return Yf(e,t.voterId,t.targetId);case"ADVANCE_VOTING":return Qf(e);case"RESOLVE":return cc(e);case"GUESS_WORD":return Gf(e,t.word);case"PLAY_AGAIN":return Kf(e);case"RESET":return sc();default:return e}}const dc=T.createContext(null);function Zf({children:e}){const[t,n]=T.useReducer(Xf,void 0,sc),r=T.useMemo(()=>({state:t,dispatch:n}),[t]);return u.jsx(dc.Provider,{value:r,children:e})}function dn(){const e=T.useContext(dc);if(!e)throw new Error("useGame must be used within GameProvider");return e}function qf({onStart:e}){const[t,n]=T.useState(!1);return u.jsxs(u.Fragment,{children:[u.jsx("style",{children:`
        .home-root{
          --paper:#F6EFE2; --paper2:#EDE2C9; --card:#FFF9EC;
          --ink:#2A2118; --ink50:rgba(42,33,24,.55); --ink35:rgba(42,33,24,.3);
          --ink15:rgba(42,33,24,.15); --ink05:rgba(42,33,24,.05);
          --terra:#C8412B; --terra2:#E85C2A; --saffron:#F2B23D;
          --tea:#1F7A6B; --mint:#3FBA9A;
          --dim:#8A7A63; --chalk:#4A3826;
          --shadow:0 6px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          --shadow-sm2:0 3px 0 var(--paper2);
          background:var(--paper);
          background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><g fill="none" stroke="%232A2118" stroke-opacity=".06" stroke-width="1.6"><path d="M48 16L54 8L62 16L70 8L78 16L86 8L94 16L86 24L94 32L86 40L94 48L86 56L94 64L86 72L94 80L86 88L78 80L70 88L62 80L54 88L46 80L38 88L30 80L22 88L14 80L6 88L14 72L6 64L14 56L6 48L14 40L6 32L14 24L6 16L14 8L22 16L30 8L38 16L46 8Z"/></g></svg>');
          background-size:96px 96px;
          color:var(--ink);
          min-height:100%;
          display:flex;flex-direction:column;align-items:center;
          padding:26px 22px 30px;
          overflow-y:auto;overscroll-behavior:none;
          -webkit-user-select:none;user-select:none;
        }
        .home-root *{box-sizing:border-box}
        @keyframes marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes stampIn{0%{opacity:0;transform:scale(1.7) rotate(-8deg)}60%{transform:scale(.9) rotate(1deg)}100%{opacity:1;transform:scale(1) rotate(1.4deg)}}
        @keyframes titleBob{0%,100%{transform:rotate(-.6deg) translateY(0)}50%{transform:rotate(.6deg) translateY(-4px)}}
        @keyframes floatOrb{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-16px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}

        .ticker{
          position:relative;overflow:hidden;align-self:stretch;
          background:var(--ink);color:var(--paper);
          font-size:13px;font-weight:800;letter-spacing:.5px;
          padding:9px 0;border:2.5px solid var(--ink);
          border-radius:10px;box-shadow:var(--shadow-sm);margin-bottom:8px;
        }
        .ticker .track{display:inline-block;white-space:nowrap;padding:0 4px;
          animation:marq 26s linear infinite;will-change:transform}
        .ticker .track b{color:var(--saffron)}

        .home-hero{display:flex;flex-direction:column;align-items:center;width:100%}
        .home-mascot-wrap{position:relative;display:inline-block;margin:14px 0 12px}
        .star8{
          position:absolute;inset:-44px;margin:auto;width:160px;height:160px;
          animation:spin 16s linear infinite;
          filter:drop-shadow(2px 2px 0 rgba(42,33,24,.18));
        }
        .tape{
          position:absolute;z-index:2;
          background:rgba(242,178,61,.88);
          border:2px solid var(--ink);border-radius:4px;
          top:8px;right:-16px;width:66px;height:17px;
          transform:rotate(8deg);
          box-shadow:var(--shadow-sm2);
        }
        .home-mascot-emoji{
          font-size:58px;display:block;position:relative;z-index:1;
          background:var(--card);border:3px solid var(--ink);border-radius:18px;
          padding:12px;line-height:1;
          box-shadow:var(--shadow-sm);
          transform:rotate(-3deg);
          animation:titleBob 3.6s ease-in-out infinite;
        }
        .home-title-wrap{display:flex;flex-direction:column;align-items:center;gap:2px}
        .home-title-1{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(64px,20vw,96px);line-height:.92;color:var(--terra);
          text-shadow:3px 3px 0 var(--saffron),5px 5px 0 var(--ink);
          animation:titleBob 3.6s ease-in-out infinite;
        }
        .home-title-1::after{
          content:'';display:block;height:10px;margin-top:-2px;
          background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="12" viewBox="0 0 120 12"><path d="M2 8 Q10 2 20 6 T40 7 T60 5 T80 7 T100 5 T118 7" fill="none" stroke="%23F2B23D" stroke-width="5" stroke-linecap="round"/></svg>') repeat-x;
          background-size:auto 10px;background-position:center;
        }
        .home-title-2{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(64px,20vw,96px);line-height:.92;color:var(--ink);
          animation:titleBob 3.6s ease-in-out infinite .15s;
        }
        .home-darija-badge{
          display:inline-flex;align-items:center;gap:6px;
          font-size:13px;font-weight:900;margin-top:14px;
          padding:6px 16px;border-radius:8px;
          background:var(--terra);color:var(--paper);
          border:2.5px solid var(--ink);box-shadow:var(--shadow-sm);
          transform:rotate(1.2deg);
          animation:stampIn .55s cubic-bezier(.22,1,.36,1) both;
        }
        .home-tagline{
          font-size:clamp(14px,4.2vw,17px);font-weight:900;color:var(--chalk);
          margin-top:14px;
        }
        .home-feats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;width:100%;margin-top:22px}
        .home-feat{
          background:var(--card);border:2.5px solid var(--ink);
          border-radius:12px;padding:12px 5px;text-align:center;
          box-shadow:var(--shadow-sm);transition:transform .12s;
          animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both;
        }
        .home-feat:nth-child(2){transform:rotate(1deg)}
        .home-feat:nth-child(3){transform:rotate(-1.2deg)}
        .home-feat:hover{transform:translateY(-2px)}
        .home-feat-ico{font-size:24px;display:block;margin-bottom:5px}
        .home-feat-lbl{font-size:11px;font-weight:800;color:var(--dim);line-height:1.5;display:block}

        .home-cta{
          width:100%;margin-top:24px;
          font-family:'Lalezar','Cairo',sans-serif;font-size:26px;letter-spacing:.5px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--terra2) 55%,var(--saffron) 140%);
          color:var(--paper);border:3px solid var(--ink);border-radius:16px;
          padding:18px 20px;cursor:pointer;box-shadow:var(--shadow);
          transition:transform .12s,box-shadow .12s;
          animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both .2s;
        }
        .home-cta:hover{transform:translateY(-2px)}
        .home-cta:active{transform:translateY(3px);box-shadow:0 3px 0 var(--ink)}
        
        .home-ghost-btn{
          width:100%;margin-top:12px;
          font-family:'Cairo',sans-serif;font-size:18px;font-weight:900;
          background:var(--paper);color:var(--ink);
          border:3px solid var(--ink);border-radius:16px;
          padding:14px 20px;cursor:pointer;box-shadow:var(--shadow-sm);
          transition:transform .12s,box-shadow .12s;
          animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both .3s;
        }
        .home-ghost-btn:hover{transform:translateY(-2px)}
        .home-ghost-btn:active{transform:translateY(3px);box-shadow:0 0 0 var(--ink)}

        .home-foot{
          margin-top:16px;font-size:12px;font-weight:800;color:var(--dim);text-align:center;
        }

        /* Modal Styles */
        .modal-overlay {
          position:fixed;top:0;left:0;right:0;bottom:0;
          background:var(--ink35);backdrop-filter:blur(4px);
          display:flex;justify-content:center;align-items:center;
          z-index:100;padding:20px;
          animation:fadeIn .2s ease-out;
        }
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes popIn{0%{transform:scale(.95);opacity:0}100%{transform:scale(1);opacity:1}}
        
        .modal-content {
          background:var(--paper);
          background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><g fill="none" stroke="%232A2118" stroke-opacity=".06" stroke-width="1.6"><path d="M48 16L54 8L62 16L70 8L78 16L86 8L94 16L86 24L94 32L86 40L94 48L86 56L94 64L86 72L94 80L86 88L78 80L70 88L62 80L54 88L46 80L38 88L30 80L22 88L14 80L6 88L14 72L6 64L14 56L6 48L14 40L6 32L14 24L6 16L14 8L22 16L30 8L38 16L46 8Z"/></g></svg>');
          background-size:96px 96px;
          width:100%;max-width:400px;max-height:90vh;overflow-y:auto;
          border:3px solid var(--ink);border-radius:20px;
          padding:28px 20px 24px;box-shadow:var(--shadow);
          position:relative;
          animation:popIn .3s cubic-bezier(.22,1,.36,1);
        }
        
        .modal-close {
          position:absolute;top:16px;left:16px;
          width:36px;height:36px;
          background:var(--card);border:2.5px solid var(--ink);border-radius:50%;
          font-size:16px;font-weight:bold;cursor:pointer;color:var(--ink);
          display:flex;justify-content:center;align-items:center;
          box-shadow:var(--shadow-sm);transition:transform .1s,box-shadow .1s;
        }
        .modal-close:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
        
        .modal-title {
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:32px;color:var(--terra);line-height:1;
          text-shadow:2px 2px 0 var(--ink);margin-bottom:24px;text-align:center;
        }
        
        .modal-steps {
          display:flex;flex-direction:column;gap:12px;
        }
        
        .step-card {
          background:var(--card);border:2.5px solid var(--ink);border-radius:12px;
          padding:12px;display:flex;gap:14px;align-items:center;
          box-shadow:var(--shadow-sm);
        }
        
        .step-emoji {
          font-size:24px;background:var(--paper);border:2px solid var(--ink);
          border-radius:8px;width:44px;height:44px;display:flex;
          justify-content:center;align-items:center;flex-shrink:0;
        }
        
        .step-text {
          display:flex;flex-direction:column;gap:4px;
        }
        
        .step-title {
          font-size:15px;font-weight:900;color:var(--ink);
        }
        
        .step-desc {
          font-size:13px;font-weight:700;color:var(--chalk);line-height:1.4;
        }
        
        .modal-btn {
          width:100%;margin-top:24px;
          font-family:'Lalezar','Cairo',sans-serif;font-size:22px;
          background:var(--tea);color:var(--paper);
          border:3px solid var(--ink);border-radius:16px;
          padding:14px;cursor:pointer;box-shadow:var(--shadow);
          transition:transform .12s,box-shadow .12s;
        }
        .modal-btn:hover{transform:translateY(-2px)}
        .modal-btn:active{transform:translateY(3px);box-shadow:0 3px 0 var(--ink)}

        @media(prefers-reduced-motion:reduce){
          .home-root *{animation:none!important;transition:none!important}
        }
      `}),u.jsxs("div",{className:"home-root",dir:"rtl",children:[u.jsx("div",{className:"ticker","aria-hidden":"true",children:u.jsxs("span",{className:"track",children:[u.jsx("b",{children:"ارسم كلمة"})," 🕵️ بالدارجة 100% • كل واحد يرسم والمحتال يخمّم ✦ ",u.jsx("b",{children:"ارسم كلمة"})," 🕵️ بالدارجة 100% • كل واحد يرسم والمحتال يخمّم ✦"]})}),u.jsxs("div",{className:"home-hero",children:[u.jsxs("div",{className:"home-mascot-wrap",children:[u.jsx("svg",{className:"star8",viewBox:"0 0 100 100","aria-hidden":"true",children:u.jsxs("g",{fill:"none",stroke:"#F2B23D",strokeWidth:"3",children:[u.jsx("path",{d:"M50 6 L59 41 L94 50 L59 59 L50 94 L41 59 L6 50 L41 41 Z"}),u.jsx("circle",{cx:"50",cy:"50",r:"9"})]})}),u.jsx("span",{className:"tape"}),u.jsx("span",{className:"home-mascot-emoji",children:"🕵️"})]}),u.jsxs("div",{className:"home-title-wrap",children:[u.jsx("span",{className:"home-title-1",children:"ارسم"}),u.jsx("span",{className:"home-title-2",children:"كلمة"})]}),u.jsx("div",{className:"home-darija-badge",children:"🇲🇦 بالدارجة"}),u.jsx("p",{className:"home-tagline",children:"واش نجيبدوها؟ 😅"})]}),u.jsxs("div",{className:"home-feats",children:[u.jsxs("div",{className:"home-feat",children:[u.jsx("span",{className:"home-feat-ico",children:"👥"}),u.jsxs("span",{className:"home-feat-lbl",children:["3–15",u.jsx("br",{}),"لاعبين"]})]}),u.jsxs("div",{className:"home-feat",children:[u.jsx("span",{className:"home-feat-ico",children:"📱"}),u.jsxs("span",{className:"home-feat-lbl",children:["تيليفون",u.jsx("br",{}),"واحد"]})]}),u.jsxs("div",{className:"home-feat",children:[u.jsx("span",{className:"home-feat-ico",children:"🎨"}),u.jsxs("span",{className:"home-feat-lbl",children:["رسم و",u.jsx("br",{}),"تخمين"]})]})]}),u.jsx("button",{className:"home-cta",onClick:e,children:"🚀 يلا نبداو"}),u.jsx("button",{className:"home-ghost-btn",onClick:()=>n(!0),children:"❓ كيفاش نلعبو؟"}),u.jsx("p",{className:"home-foot",children:"لعبة رفيق المكتب — اكتشف المحتال قبل ما يفوتك"}),t&&u.jsx("div",{className:"modal-overlay",onClick:()=>n(!1),children:u.jsxs("div",{className:"modal-content",onClick:r=>r.stopPropagation(),children:[u.jsx("button",{className:"modal-close",onClick:()=>n(!1),children:"✕"}),u.jsx("h2",{className:"modal-title",children:"📖 كيفاش نلعبو"}),u.jsxs("div",{className:"modal-steps",children:[u.jsxs("div",{className:"step-card",children:[u.jsx("div",{className:"step-emoji",children:"🎭"}),u.jsxs("div",{className:"step-text",children:[u.jsx("span",{className:"step-title",children:"المرحلة 1"}),u.jsx("span",{className:"step-desc",children:"كل واحد يشوف دوره سري (محتال أو فالسالفة)"})]})]}),u.jsxs("div",{className:"step-card",children:[u.jsx("div",{className:"step-emoji",children:"🎨"}),u.jsxs("div",{className:"step-text",children:[u.jsx("span",{className:"step-title",children:"المرحلة 2"}),u.jsx("span",{className:"step-desc",children:"كل لاعب يرسم الكلمة — المحتال ما يعرفهاش!"})]})]}),u.jsxs("div",{className:"step-card",children:[u.jsx("div",{className:"step-emoji",children:"🗳️"}),u.jsxs("div",{className:"step-text",children:[u.jsx("span",{className:"step-title",children:"المرحلة 3"}),u.jsx("span",{className:"step-desc",children:"بعد ما الكل رسم، صوتو على شكون المحتال"})]})]}),u.jsxs("div",{className:"step-card",children:[u.jsx("div",{className:"step-emoji",children:"🏆"}),u.jsxs("div",{className:"step-text",children:[u.jsx("span",{className:"step-title",children:"المرحلة 4"}),u.jsx("span",{className:"step-desc",children:"المحتال يقدر يخمن الكلمة باش يربح نقطة إضافية"})]})]})]}),u.jsx("button",{className:"modal-btn",onClick:()=>n(!1),children:"✅ فهمت!"})]})})]})]})}function Jf(){const{state:e,dispatch:t}=dn(),n=T.useRef(null);T.useEffect(()=>{if(!(e.phase!=="setup"||e.players.length>0))for(let h=1;h<=At;h++)t({type:"ADD_PLAYER",name:`لاعب ${h}`})},[]);function r(h){const m=Math.max(At,Math.min($o,Math.round(h))),x=e.players.length;if(m>x){let w=m-x,k=x+1;for(let R=0;R<$o*2&&w>0;R++){const d=`لاعب ${k}`;e.players.some(c=>c.name===d)||(t({type:"ADD_PLAYER",name:d}),w--),k++}}else if(m<x){const w=e.players.slice(m).map(k=>k.id);for(const k of w)t({type:"REMOVE_PLAYER",id:k})}}function l(h){t({type:"SELECT_CATEGORY",category:h})}function o(){t({type:"SELECT_CATEGORY",category:ac()})}const i=()=>{n.current&&n.current.scrollBy({left:-200,behavior:"smooth"})},a=()=>{n.current&&n.current.scrollBy({left:200,behavior:"smooth"})},s=e.category,f=e.players.length>=At&&!!s;let v="";return f||(e.players.length<At?v=`زيد على الأقل ${At-e.players.length} لاعبين`:s||(v="اختار فئة أولاً")),u.jsxs(u.Fragment,{children:[u.jsxs("div",{className:"setup-container",dir:"rtl",children:[u.jsxs("header",{className:"setup-header",children:[u.jsx("h1",{className:"setup-title",children:"ارسم كلمة 🎨"}),u.jsx("p",{className:"setup-subtitle",children:"اللعبة المجنونة"})]}),u.jsxs("section",{className:"setup-section",children:[u.jsx("h2",{className:"section-title justify-content-center",style:{textAlign:"center",display:"block"},children:"شكون غادي يلعب؟ 🎲"}),u.jsx("p",{className:"section-desc",style:{textAlign:"center"},children:"الأسماء كتكتب وحدها — إلا بغيتي بدلهم 😉"}),u.jsxs("div",{className:"count-row mt-3",children:[[3,4,5,6,7].map(h=>u.jsx("button",{type:"button",className:`count-chip ${e.players.length===h?"on":""}`,onClick:()=>r(h),children:h},h)),u.jsx("button",{type:"button",className:`count-chip count-more ${e.players.length>7?"on":""}`,onClick:()=>r(e.players.length+1),children:"..."})]}),u.jsx("div",{className:"player-inputs",children:e.players.map(h=>u.jsxs("div",{className:"player-input-wrap",children:[u.jsx("span",{className:"player-dot",style:{backgroundColor:h.color}}),u.jsx("input",{type:"text",className:"player-input",value:h.name,onChange:m=>t({type:"UPDATE_PLAYER",id:h.id,name:m.target.value}),maxLength:14,placeholder:`لاعب ${e.players.indexOf(h)+1}`})]},h.id))})]}),u.jsxs("section",{className:"setup-section",style:{paddingRight:0,paddingLeft:0},children:[u.jsx("h3",{className:"section-title px-3 mb-3",style:{fontSize:"15px",color:"var(--dim)",justifyContent:"flex-start",fontFamily:"Cairo, sans-serif",fontWeight:800},children:"الفئة"}),u.jsxs("div",{className:"cat-carousel",children:[u.jsx("button",{type:"button",className:"nav-btn nav-left d-none d-md-flex",onClick:i,children:"◀"}),u.jsxs("div",{className:"cat-slider",ref:n,children:[u.jsxs("div",{className:"cat-slide is-random",onClick:o,children:[u.jsx("div",{className:"cat-emoji",children:"🎲"}),u.jsx("div",{className:"cat-title",children:"عشوائية"}),u.jsx("div",{className:"cat-count",children:"جرب حظك"})]}),Vo.map((h,m)=>{const x=(s==null?void 0:s.id)===h.id;return u.jsxs("div",{className:`cat-slide ${x?"on":""}`,onClick:()=>l(h),children:[u.jsx("span",{className:"slide-n",children:m+1}),u.jsx("div",{className:"cat-emoji",children:h.emoji}),u.jsx("div",{className:"cat-title",children:h.title}),u.jsxs("div",{className:"cat-count",children:[h.words.length," كلمات"]})]},h.id)})]}),u.jsx("button",{type:"button",className:"nav-btn nav-right d-none d-md-flex",onClick:a,children:"▶"})]})]}),u.jsxs("section",{className:"start-section mt-4 mb-2",children:[u.jsxs("button",{type:"button",className:"start-btn",disabled:!f,onClick:()=>t({type:"START_GAME"}),children:["🚀 ابدأ اللعبة (",e.players.length," لاعبين)"]}),v&&u.jsx("p",{className:"start-hint",children:v})]})]}),u.jsx("style",{children:`
        .setup-container {
          --paper: #F6EFE2;
          --paper2: #EDE2C9;
          --card: #FFF9EC;
          --ink: #2A2118;
          --ink15: rgba(42,33,24,.15);
          --ink50: rgba(42,33,24,.55);
          --terra: #C8412B;
          --terra2: #E85C2A;
          --saffron: #F2B23D;
          --tea: #1F7A6B;
          --mint: #3FBA9A;
          --dim: #8A7A63;
          --shadow: 0 4px 0 var(--ink);
          --shadow-sm: 0 3px 0 var(--ink);

          font-family: 'Cairo', sans-serif;
          background: var(--paper);
          color: var(--ink);
          max-width: 460px;
          margin: 0 auto;
          width: 100%;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          padding: 20px 18px calc(24px + env(safe-area-inset-bottom));
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 24px;
          flex-shrink: 0;
        }
        .setup-title {
          font-family: 'Lalezar', cursive;
          font-size: clamp(40px, 13vw, 60px);
          line-height: 1;
          color: var(--ink);
          margin: 0 0 4px 0;
        }
        .setup-subtitle {
          font-size: 15px;
          font-weight: 700;
          color: var(--dim);
          margin: 0;
        }

        .setup-section {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
        }

        .section-title {
          font-family: 'Lalezar', cursive;
          font-size: 30px;
          margin: 0 0 6px 0;
          color: var(--ink);
          font-weight: 400;
          line-height: 1.1;
        }
        
        .section-desc {
          font-size: 13px;
          color: var(--dim);
          margin-bottom: 12px;
        }

        .count-row {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 16px;
        }
        .count-chip {
          flex: 1;
          max-width: 52px;
          height: 48px;
          padding: 0;
          font-size: 20px;
          font-weight: 900;
          border-radius: 12px;
          background: var(--card);
          border: 2.5px solid var(--ink);
          box-shadow: 0 3px 0 var(--ink);
          color: var(--ink);
          display: grid;
          place-items: center;
          transition: transform 0.1s, box-shadow 0.1s, background 0.15s;
          cursor: pointer;
        }
        .count-chip:hover { transform: translateY(-2px); }
        .count-chip:active { transform: translateY(1px); box-shadow: 0 1px 0 var(--ink); }
        .count-chip.on {
          background: var(--terra);
          color: var(--paper);
          box-shadow: 3px 3px 0 var(--ink);
        }

        .player-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
          margin-bottom: 24px;
        }
        .player-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .player-input-wrap .player-dot {
          position: absolute;
          right: 16px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--ink);
          z-index: 2;
        }
        .player-input {
          width: 100%;
          font-family: inherit;
          font-size: 16px;
          font-weight: 700;
          padding: 13px 16px 13px 16px;
          padding-right: 40px; /* space for the dot */
          border-radius: 14px;
          border: 2.5px dashed var(--ink50);
          background: var(--card);
          color: var(--ink);
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .player-input:focus {
          border-style: solid;
          border-color: var(--tea);
          box-shadow: 0 3px 0 var(--ink);
        }

        .cat-carousel {
          position: relative;
          margin-top: 8px;
        }
        .cat-slider {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 6px 2px 14px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          scroll-snap-type: x mandatory;
        }
        .cat-slider::-webkit-scrollbar {
          display: none;
        }
        
        .cat-slide {
          flex: 0 0 calc((100% - 18px) / 3.5);
          scroll-snap-align: start;
          position: relative;
          min-height: 130px;
          text-align: center;
          background: var(--card);
          border: 2.5px solid var(--ink);
          border-radius: 16px;
          padding: 16px 8px 12px;
          color: var(--ink);
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s, background 0.15s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          line-height: 1.3;
          box-shadow: 0 3px 0 var(--ink);
        }
        .cat-slide:hover { transform: translateY(-2px); }
        .cat-slide:active { transform: translateY(1px); box-shadow: 0 1px 0 var(--ink); }
        .cat-slide.on {
          background: #FFF1DC;
          box-shadow: 3px 3px 0 var(--terra);
          border-color: var(--terra);
        }
        .cat-slide.is-random { background: var(--paper2); }

        .cat-emoji { font-size: 32px; line-height: 1; margin-top: 4px; }
        .cat-title { font-size: 13px; font-weight: 800; color: var(--ink); }
        .cat-count { font-size: 11px; color: var(--dim); font-weight: 700; }
        .cat-slide.on .cat-count { color: var(--ink50); }
        
        .slide-n {
          position: absolute;
          top: 6px;
          right: 8px;
          font-size: 10px;
          font-weight: 900;
          color: var(--dim);
          background: var(--paper2);
          border: 1.5px solid var(--ink35);
          border-radius: 99px;
          padding: 1px 6px;
        }

        .slide-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
          color: var(--dim);
          margin: -4px 0 2px;
        }

        .spacer { flex: 1; }

        .start-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--terra) 0%, var(--terra2) 55%, var(--saffron) 140%);
          border: 3px solid var(--ink);
          border-radius: 16px;
          padding: 16px 20px;
          font-family: 'Lalezar', cursive;
          font-size: 22px;
          font-weight: 400;
          color: var(--paper);
          box-shadow: 0 4px 0 var(--ink);
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s;
        }
        .start-btn:active:not(:disabled) {
          transform: translateY(3px);
          box-shadow: 0 1px 0 var(--ink);
        }
        .start-btn:disabled {
          background: var(--paper2);
          box-shadow: 0 2px 0 var(--ink);
          border-color: var(--ink);
          color: var(--ink50);
          cursor: not-allowed;
          opacity: 0.6;
        }
      `})]})}function ep(){var p,g;const{state:e,dispatch:t}=dn(),n=e.revealOrder[e.revealIndex],r=e.players.find(S=>S.id===n),l=n===e.imposterId,o=e.revealIndex===e.revealOrder.length-1,[i,a]=T.useState(!1),[s,f]=T.useState(0),[v,h]=T.useState(!1),m=T.useRef(0),x=T.useRef(0),w=200,k=T.useCallback(S=>{if(v)return;S.currentTarget.setPointerCapture(S.pointerId),a(!0),f(0),x.current=performance.now();const E=N=>{const z=N-x.current,A=Math.min(100,z/w*100);f(A),A<100?m.current=requestAnimationFrame(E):(a(!1),h(!0))};m.current=requestAnimationFrame(E)},[v]),R=T.useCallback(()=>{v||(cancelAnimationFrame(m.current),a(!1),f(0))},[v]);if(T.useEffect(()=>()=>cancelAnimationFrame(m.current),[]),T.useEffect(()=>{h(!1),f(0),a(!1)},[n]),!r)return null;const d=()=>t({type:"ADVANCE_REVEAL"}),c=l?{label:"أنت المحتال!",emoji:"🕵️",sub:"مثل أنك تعرف الكلمة!"}:{label:e.secretWord??"",emoji:"🎨",sub:`${(p=e.category)==null?void 0:p.emoji} ${(g=e.category)==null?void 0:g.title}`};return u.jsxs(u.Fragment,{children:[u.jsx("style",{children:`
        .rr-root {
          --paper:#F6EFE2; --card:#FFF9EC;
          --ink:#2A2118; --ink15:rgba(42,33,24,.15); --ink50:rgba(42,33,24,.5);
          --terra:#C8412B; --saffron:#F2B23D; --tea:#1F7A6B; --dim:#8A7A63;
          --shadow:0 4px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          background:var(--paper);
          min-height:100dvh;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:24px 20px calc(28px + env(safe-area-inset-bottom));
          font-family:'Cairo',system-ui,sans-serif;
          color:var(--ink);
          -webkit-user-select:none; user-select:none;
        }
        .rr-root *{box-sizing:border-box}

        @keyframes rrSlide{
          from{opacity:0;transform:translateX(30px)}
          to{opacity:1;transform:none}
        }
        @keyframes rrPop{
          0%{opacity:0;transform:scale(.8) rotate(-3deg)}
          60%{transform:scale(1.05) rotate(1deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes rrRoll{
          0%{transform:translateY(-100%);opacity:0}
          20%{transform:translateY(0);opacity:1}
          80%{transform:translateY(0);opacity:1}
          100%{transform:translateY(100%);opacity:0}
        }
        @keyframes rrStamp{
          0%{transform:scale(1.5);opacity:0}
          100%{transform:scale(1);opacity:1}
        }

        .rr-inner {
          width:100%; max-width:440px;
          display:flex; flex-direction:column; align-items:center; gap:24px;
          /* Key triggers slide animation on every player change */
          animation: rrSlide 0.4s ease-out both;
        }

        /* ── HEADER ── */
        .rr-header {
          text-align:center;
          background:var(--card); border:3px solid var(--ink);
          border-radius:18px; padding:16px 20px;
          box-shadow:var(--shadow-sm); width:100%;
        }
        .rr-step {
          font-size:14px; font-weight:800; color:var(--dim);
          margin-bottom:8px;
        }
        .rr-player-name {
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:36px; line-height:1;
        }

        /* ── HOLD BUTTON / CARD ── */
        .rr-card-wrap {
          width:100%; aspect-ratio:1; max-height:360px;
          position:relative;
          perspective:1000px;
        }
        .rr-card {
          width:100%; height:100%;
          background:var(--card); border:3px dashed var(--ink50);
          border-radius:24px; box-shadow:var(--shadow-sm);
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center; padding:20px;
          transition:transform .2s, box-shadow .2s, border-color .25s, background .25s;
          cursor:pointer; touch-action:none;
          position:relative; overflow:hidden;
        }
        .rr-card:active:not(.revealed){
          transform:translateY(4px); box-shadow:0 0 0 var(--ink);
        }
        .rr-card.holding {
          border-color:var(--terra);
          border-style:solid;
          background:#FFF1DC;
        }
        .rr-card.revealed {
          cursor:default;
          border-style:solid;
          animation:rrPop 0.5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .rr-card.revealed.imp { background:#FFD9C7; border-color:var(--terra); }
        .rr-card.revealed.ok { background:#D8F0E4; border-color:var(--tea); }

        /* Progress ring (bara-salfa style) */
        .rr-prog-ring {
          width:88px; height:88px; border-radius:50%;
          display:grid; place-items:center;
          border:3px solid var(--ink);
          margin-bottom:16px;
        }
        .rr-prog-inner {
          width:64px; height:64px; border-radius:50%;
          background:var(--paper); display:grid; place-items:center;
          font-size:28px; border:2px solid var(--ink);
        }

        /* Content */
        .rr-card-content { z-index:2; position:relative; }
        .rr-hint { font-size:15px; font-weight:800; color:var(--dim); }

        /* Revealed Content */
        .rr-rev-emoji { font-size:64px; margin-bottom:8px; animation:rrStamp .4s cubic-bezier(.34,1.56,.64,1); }
        .rr-rev-label {
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(32px, 9vw, 42px);
          color:var(--ink); line-height:1.2;
          background:linear-gradient(180deg,rgba(242,178,61,.5),rgba(242,178,61,.22));
          padding:2px 18px; border-radius:10px; transform:rotate(-1deg);
          display:inline-block; margin:8px 0;
          text-shadow:2px 2px 0 rgba(255,255,255,.65);
        }
        .rr-rev-sub { font-size:16px; font-weight:800; color:var(--ink50); margin-top:8px; }

        /* ── NEXT BUTTON ── */
        .rr-next-btn {
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif; font-size:24px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--saffron) 140%);
          color:var(--paper); border:3px solid var(--ink); border-radius:16px;
          padding:16px; cursor:pointer; box-shadow:var(--shadow);
          transition:transform .12s, box-shadow .12s;
          animation:rrSlide .3s both .2s;
        }
        .rr-next-btn:active{transform:translateY(3px);box-shadow:0 3px 0 var(--ink)}
        
        .rr-pass-text {
          font-size:14px; font-weight:800; color:var(--dim);
          text-align:center; margin-top:-10px;
          animation:rrSlide .3s both .3s;
        }

        @media(prefers-reduced-motion:reduce){.rr-root *{animation:none!important;transition:none!important}}
      `}),u.jsx("div",{className:"rr-root",dir:"rtl",children:u.jsxs("div",{className:"rr-inner",children:[u.jsxs("div",{className:"rr-header",children:[u.jsxs("div",{className:"rr-step",children:["اللاعب ",e.revealIndex+1," من ",e.players.length]}),u.jsx("div",{className:"rr-player-name",style:{color:r.color},children:r.name}),u.jsxs("div",{style:{fontSize:13,fontWeight:800,color:"var(--dim)",marginTop:4},children:["عطيو التيليفون لـ ",r.name]})]}),u.jsx("div",{className:"rr-card-wrap",children:u.jsxs("div",{className:`rr-card ${i?"holding":""} ${v?"revealed":""} ${v?l?"imp":"ok":""}`,onPointerDown:k,onPointerUp:R,onPointerCancel:R,onPointerLeave:R,children:[!v&&u.jsxs(u.Fragment,{children:[u.jsx("div",{className:"rr-prog-ring",style:{background:`conic-gradient(var(--saffron) ${s}%, var(--ink15) 0)`},children:u.jsx("div",{className:"rr-prog-inner",children:"👁️"})}),u.jsx("div",{className:"rr-card-content",children:u.jsx("div",{className:"rr-hint",children:"اضغط مطولاً لكشف دورك"})})]}),v&&u.jsxs("div",{className:"rr-card-content",children:[u.jsx("div",{className:"rr-rev-emoji",children:c.emoji}),u.jsx("div",{className:"rr-rev-label",children:c.label}),u.jsx("div",{className:"rr-rev-sub",children:c.sub})]})]})}),v&&u.jsxs(u.Fragment,{children:[u.jsx("button",{className:"rr-next-btn",onClick:d,children:o?"🎨 يلا نرسمو!":"✅ التالي"}),!o&&u.jsx("div",{className:"rr-pass-text",children:"خبي دورك وعطي التيليفون للي بعدك"})]})]},n)})]})}function tp({strokes:e,activeColor:t,brushSize:n=5,onStrokeComplete:r}){const l=T.useRef(null),o=T.useRef(null),i=T.useRef(null),a=T.useRef([]),s=T.useRef(!1),[f,v]=T.useState(!1);T.useEffect(()=>{const d=l.current,c=o.current;if(!d||!c)return;const p=()=>{const z=window.devicePixelRatio||1,A=c.getBoundingClientRect();if(A.width===0||A.height===0)return;const L=d.toDataURL();d.width=Math.round(A.width*z),d.height=Math.round(A.height*z);const H=d.getContext("2d");if(!H)return;i.current=H,H.lineCap="round",H.lineJoin="round";const de=new Image;de.onload=()=>{H.drawImage(de,0,0,d.width,d.height),v(!0)},de.src=L},g=window.devicePixelRatio||1,S=c.getBoundingClientRect();d.width=Math.round(S.width*g),d.height=Math.round(S.height*g);const E=d.getContext("2d");if(!E)return;i.current=E,E.lineCap="round",E.lineJoin="round",v(!0);const N=new ResizeObserver(p);return N.observe(c),()=>N.disconnect()},[]),T.useEffect(()=>{f&&h(a.current)},[e,f]);function h(d){const c=l.current,p=i.current,g=o.current;if(!c||!p||!g)return;const S=window.devicePixelRatio||1;p.clearRect(0,0,c.width,c.height);for(const E of e)m(p,E.points,E.color,E.width,S,g);d.length>1&&t&&m(p,d,t,n,S,g)}function m(d,c,p,g,S,E){if(c.length<2)return;const{clientWidth:N,clientHeight:z}=E,A=l.current,L=A.width/N,H=A.height/z;d.strokeStyle=p,d.lineWidth=g*S,d.lineCap="round",d.lineJoin="round",d.beginPath(),d.moveTo(c[0].x*L,c[0].y*H);for(let de=1;de<c.length;de++){const Oe=c[de-1],fn=c[de];d.quadraticCurveTo(Oe.x*L,Oe.y*H,(Oe.x+fn.x)/2*L,(Oe.y+fn.y)/2*H)}d.stroke()}function x(d){const c=o.current;if(!c)return{x:0,y:0};const p=c.getBoundingClientRect();return{x:d.clientX-p.left,y:d.clientY-p.top}}function w(d){!t||s.current||(s.current=!0,d.currentTarget.setPointerCapture(d.pointerId),a.current=[x(d)])}function k(d){!s.current||!t||(a.current=[...a.current,x(d)],h(a.current))}function R(){if(!s.current)return;s.current=!1;const d=a.current;a.current=[],h([]),d.length>=2&&r(d)}return u.jsx("div",{ref:o,style:{position:"relative",width:"100%",height:"100%",borderRadius:18,border:"3px solid #2A2118",boxShadow:"0 4px 0 #2A2118",background:"#FFFDF5",cursor:t?"crosshair":"default",overflow:"hidden"},children:u.jsx("canvas",{ref:l,onPointerDown:w,onPointerMove:k,onPointerUp:R,onPointerCancel:R,style:{width:"100%",height:"100%",display:"block",touchAction:"none"}})})}function np(){const{state:e,dispatch:t}=dn(),n=e.drawOrder[e.drawIndex],r=e.players.find(v=>v.id===n),[l,o]=T.useState(5),i=e.players.every(v=>e.drawnPlayerIds.includes(v.id));if(!r)return null;const a=v=>{const h={playerId:n,color:r.color,points:v,width:l};t({type:"COMMIT_STROKE",stroke:h})},s=()=>t({type:"NEXT_DRAWER"}),f=()=>t({type:"GO_TO_VOTING"});return u.jsxs(u.Fragment,{children:[u.jsx("style",{children:`
        .dr-root {
          --paper:#F6EFE2; --card:#FFF9EC;
          --ink:#2A2118; --ink15:rgba(42,33,24,.15); --ink50:rgba(42,33,24,.5);
          --terra:#C8412B; --terra2:#E85C2A; --saffron:#F2B23D;
          --tea:#1F7A6B; --mint:#3FBA9A; --dim:#8A7A63;
          --shadow:0 4px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          background:var(--paper);
          height:100dvh; overflow:hidden;
          display:flex; flex-direction:column;
          font-family:'Cairo',system-ui,sans-serif;
          color:var(--ink);
          -webkit-user-select:none; user-select:none;
        }
        .dr-root *{box-sizing:border-box}

        @keyframes drPulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes drPop{0%{opacity:0;transform:scale(.82) rotate(-2deg)}70%{transform:scale(1.04)}100%{opacity:1;transform:none}}
        @keyframes drFade{from{opacity:0}to{opacity:1}}

        /* ── HEADER & QUEUE ── */
        .dr-header {
          flex-shrink:0;
          display:flex; flex-direction:column; gap:12px;
          padding:16px 16px 8px;
          background:var(--card);
          border-bottom:3px solid var(--ink);
          box-shadow:var(--shadow-sm);
          position:relative; z-index:10;
        }
        
        .dr-turn-banner {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          text-align:center;
        }
        .dr-turn-title {
          font-size:14px; font-weight:800; color:var(--dim);
          margin-bottom:2px;
        }
        .dr-turn-name {
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:36px; line-height:1;
          color:var(--ink);
          text-shadow:1px 1px 0 rgba(255,255,255,0.5);
          animation:drPop .3s cubic-bezier(.34,1.56,.64,1) both;
        }

        .dr-queue-row {
          display:flex; align-items:center; gap:8px;
          overflow-x:auto; padding-bottom:8px;
          scrollbar-width:none; -ms-overflow-style:none;
        }
        .dr-queue-row::-webkit-scrollbar { display:none; }
        
        .dr-q-chip {
          display:flex; align-items:center; gap:6px;
          background:var(--paper); border:2.5px solid var(--ink);
          border-radius:99px; padding:6px 12px 6px 8px;
          font-size:13px; font-weight:800; color:var(--dim);
          box-shadow:0 2px 0 var(--ink);
          opacity: 0.6;
          transition:all .2s;
          white-space:nowrap;
        }
        .dr-q-chip.active {
          opacity: 1;
          background:var(--paper);
          color:var(--ink);
          border-color:var(--ink);
          transform:scale(1.05);
          box-shadow:0 3px 0 var(--ink);
        }
        .dr-q-chip .dot {
          width:12px; height:12px; border-radius:50%;
          border:2px solid var(--ink);
        }

        /* ── BODY ── */
        .dr-body {
          flex:1; min-height:0;
          display:flex; flex-direction:column;
          padding:12px; gap:12px;
        }
        @media(min-width:768px){
          .dr-body{flex-direction:row; padding:16px 20px; gap:16px}
        }

        /* ── CANVAS COLUMN ── */
        .dr-canvas-col {
          flex:1; min-height:0;
          display:flex; flex-direction:column;
          gap:8px;
        }
        @media(min-width:768px){
          .dr-canvas-col{flex:2}
        }
        .dr-canvas-wrap {
          flex:1; min-height:200px;
        }

        /* ── CONTROLS COLUMN ── */
        .dr-ctrl-col {
          flex-shrink:0;
          display:flex; flex-direction:column;
          gap:12px;
        }
        @media(min-width:768px){
          .dr-ctrl-col{width:280px}
        }

        /* ── BRUSH PICKER ── */
        .dr-brush-row{
          display:flex; align-items:center; gap:8px; justify-content:center;
          background:var(--card); border:3px solid var(--ink);
          padding:10px; border-radius:16px; box-shadow:var(--shadow-sm);
        }
        .dr-brush-label{font-size:16px;font-weight:800;color:var(--dim);flex-shrink:0}
        .dr-brush-btn{
          padding:6px 14px; border-radius:99px;
          border:2.5px solid var(--ink); background:var(--paper);
          font-size:13px; font-weight:800; cursor:pointer;
          box-shadow:0 2px 0 var(--ink);
          transition:transform .1s, background .15s;
          font-family:inherit; color:var(--ink);
        }
        .dr-brush-btn:active{transform:translateY(1px)}
        .dr-brush-btn.on{background:var(--ink);color:var(--paper)}

        /* ── BUTTONS ── */
        .dr-btn-done{
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif; font-size:22px;
          background:linear-gradient(135deg,var(--tea),var(--mint));
          color:var(--paper); border:3px solid var(--ink); border-radius:16px;
          padding:16px; cursor:pointer; box-shadow:var(--shadow);
          transition:transform .12s, box-shadow .12s;
        }
        .dr-btn-done:hover{transform:translateY(-2px)}
        .dr-btn-done:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}

        .dr-btn-vote{
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif; font-size:22px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--terra2) 55%,var(--saffron) 140%);
          color:var(--paper); border:3px solid var(--ink); border-radius:16px;
          padding:16px; cursor:pointer; box-shadow:var(--shadow);
          transition:transform .12s, box-shadow .12s;
          animation:drPop .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .dr-btn-vote:hover{transform:translateY(-2px)}
        .dr-btn-vote:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
        .dr-vote-hint{
          font-size:13px;font-weight:800;color:var(--dim);
          text-align:center; margin-top:-4px;
        }

        .dr-btn-vote-ghost{
          width:100%;
          font-size:15px;font-weight:800;color:var(--dim);
          background:none;border:0;cursor:pointer;padding:8px;
          font-family:inherit;
        }
        .dr-btn-vote-ghost:hover{color:var(--terra)}

        @media(prefers-reduced-motion:reduce){.dr-root *{animation:none!important;transition:none!important}}
      `}),u.jsxs("div",{className:"dr-root",dir:"rtl",children:[u.jsxs("div",{className:"dr-header",children:[u.jsxs("div",{className:"dr-turn-banner",children:[u.jsx("div",{className:"dr-turn-title",children:"دورك باش ترسم!"}),u.jsx("div",{className:"dr-turn-name",style:{color:r.color},children:r.name})]},r.id),u.jsx("div",{className:"dr-queue-row",children:e.drawOrder.map((v,h)=>{const m=e.players.find(w=>w.id===v),x=h===e.drawIndex;return u.jsxs("div",{className:`dr-q-chip ${x?"active":""}`,children:[u.jsx("span",{className:"dot",style:{backgroundColor:m.color}}),m.name]},`${v}-${h}`)})})]}),u.jsxs("div",{className:"dr-body",children:[u.jsx("div",{className:"dr-canvas-col",children:u.jsx("div",{className:"dr-canvas-wrap",children:u.jsx(tp,{strokes:e.strokes,activeColor:r.color,brushSize:l,onStrokeComplete:a,drawerId:n},`round-${e.roundNumber}`)})}),u.jsxs("div",{className:"dr-ctrl-col",children:[u.jsxs("div",{className:"dr-brush-row",children:[u.jsx("span",{className:"dr-brush-label",children:"🖌️"}),[3,5,10,18].map(v=>u.jsx("button",{className:`dr-brush-btn ${l===v?"on":""}`,onClick:()=>o(v),children:v===3?"رفيع":v===5?"عادي":v===10?"سميك":"عريض"},v))]}),u.jsx("button",{className:"dr-btn-done",onClick:s,children:"✅ كملت — التالي"}),i?u.jsxs(u.Fragment,{children:[u.jsx("button",{className:"dr-btn-vote",onClick:f,children:"🗳️ يلا نصوتو!"}),u.jsx("div",{className:"dr-vote-hint",children:"الكل رسم — تقدرو تكملو الرسم أو تصوتو"})]}):u.jsx("button",{className:"dr-btn-vote-ghost",onClick:f,children:"تخطى للتصويت ←"})]})]})]})]})}function rp(){const{state:e,dispatch:t}=dn(),[n,r]=T.useState(null),[l,o]=T.useState(!1),i=e.players[e.votingIndex],a=e.votes.some(m=>m.voterId===(i==null?void 0:i.id)),s=m=>{!i||m===i.id||(r(m),t({type:"CAST_VOTE",voterId:i.id,targetId:m}),setTimeout(()=>o(!0),400))},f=()=>{r(null),o(!1),t({type:"ADVANCE_VOTING"})},v=e.votingIndex===e.players.length-1,h=e.players[e.votingIndex+1];return i?u.jsxs(u.Fragment,{children:[u.jsx("style",{children:`
        .vt-root {
          --paper:#F6EFE2; --card:#FFF9EC; --ink:#2A2118;
          --ink15:rgba(42,33,24,.15); --ink50:rgba(42,33,24,.55);
          --terra:#C8412B; --terra2:#E85C2A; --saffron:#F2B23D;
          --tea:#1F7A6B; --dim:#8A7A63;
          --shadow:0 4px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          background:var(--paper);
          min-height:100dvh;
          display:flex;flex-direction:column;
          padding:20px 18px calc(24px + env(safe-area-inset-bottom));
          gap:14px;
          font-family:'Cairo',system-ui,sans-serif;
          color:var(--ink);
          -webkit-user-select:none;user-select:none;
          position:relative;
        }
        .vt-root *{box-sizing:border-box}

        @keyframes vtSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes vtPop{0%{opacity:0;transform:scale(.84)}65%{transform:scale(1.04)}100%{opacity:1;transform:scale(1)}}
        @keyframes vtFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes vtCheckPop{0%{transform:scale(0) rotate(-10deg)}65%{transform:scale(1.15) rotate(2deg)}100%{transform:scale(1) rotate(0)}}

        .vt-header{text-align:center;animation:vtSlideUp .4s both}
        .vt-round-label{font-size:12px;font-weight:900;letter-spacing:.5px;color:var(--dim);text-transform:uppercase;margin-bottom:2px}
        .vt-title{font-family:'Lalezar','Cairo',sans-serif;font-size:clamp(28px,8vw,38px);color:var(--ink)}
        .vt-sub{font-size:15px;font-weight:800;color:var(--dim);margin-top:2px}

        .vt-voter-badge{
          display:flex;align-items:center;gap:8px;
          background:var(--card);border:3px solid var(--ink);
          border-radius:99px;padding:8px 18px 8px 10px;
          box-shadow:var(--shadow-sm);
          width:fit-content;margin:0 auto;
          animation:vtPop .4s .1s both;
        }
        .vt-voter-dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--ink)}
        .vt-voter-name{font-size:16px;font-weight:800}

        .vt-prog{height:8px;border-radius:4px;background:var(--ink15);border:2px solid var(--ink);overflow:hidden}
        .vt-prog-fill{
          height:100%;border-radius:2px;
          background:repeating-linear-gradient(-45deg,var(--terra) 0 10px,var(--terra2) 10px 20px);
          transition:width .4s;
        }

        .vt-question{
          font-size:16px;font-weight:900;color:var(--ink);
          text-align:center;
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:12px 16px;
          box-shadow:var(--shadow-sm);
          animation:vtSlideUp .4s .1s both;
        }

        .vt-drawings-row{
          display:flex;gap:8px;overflow-x:auto;
          padding:4px 2px 10px;scrollbar-width:none;
        }
        .vt-drawings-row::-webkit-scrollbar{display:none}
        .vt-drawing-card{
          flex:0 0 calc(33% - 4px);
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:10px 8px;
          text-align:center;box-shadow:var(--shadow-sm);
          display:flex;flex-direction:column;align-items:center;gap:4px;
        }
        .vt-drawing-dot{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--ink);display:inline-block}
        .vt-drawing-name{font-size:11px;font-weight:800;color:var(--dim)}

        .vt-candidates{display:flex;flex-direction:column;gap:8px;animation:vtSlideUp .4s .15s both}

        .vt-candidate{
          width:100%;text-align:right;
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:14px 16px;
          cursor:pointer;
          transition:border-color .15s,background .15s,transform .12s,box-shadow .15s;
          box-shadow:var(--shadow-sm);
          display:flex;align-items:center;gap:10px;
          font-family:inherit;
          position:relative;
          overflow:hidden;
        }
        .vt-candidate::after{
          content:'';position:absolute;inset:0;
          background:repeating-linear-gradient(-45deg,rgba(255,255,255,.1) 0 5px,transparent 5px 10px);
          opacity:.5;pointer-events:none;
        }
        .vt-candidate:hover{border-color:var(--ink);transform:translateY(-2px);box-shadow:var(--shadow)}
        .vt-candidate:active{transform:translateY(1px);box-shadow:0 1px 0 var(--ink)}
        .vt-candidate.voted{
          border-color:var(--terra);background:#FFF1DC;
          box-shadow:3px 3px 0 var(--terra);
          transform:none;
        }
        .vt-candidate.self-disabled{opacity:.35;cursor:not-allowed;transform:none !important}
        .vt-candidate-dot{width:16px;height:16px;border-radius:50%;border:2.5px solid var(--ink);flex-shrink:0}
        .vt-candidate-name{font-size:18px;font-weight:800;flex:1}
        .vt-candidate-check{
          font-size:20px;
          animation:vtCheckPop .4s cubic-bezier(.34,1.56,.64,1) both;
        }
        .vt-candidate-tag{
          font-size:11px;font-weight:900;letter-spacing:.3px;
          padding:2px 10px;border-radius:99px;
          background:var(--saffron);color:var(--ink);
          border:1.5px solid var(--ink);
        }

        .vt-hint{font-size:13px;font-weight:800;color:var(--dim);text-align:center}

        /* Pass-phone overlay */
        .vt-overlay{
          position:absolute;inset:0;
          background:rgba(246,239,226,.97);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:18px;padding:32px;
          animation:vtFadeIn .25s ease both;
          z-index:10;
        }
        .vt-overlay-icon{font-size:64px;animation:vtPop .4s both}
        .vt-overlay-title{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(26px,7vw,36px);
          text-align:center;color:var(--ink);
          animation:vtSlideUp .4s .1s both;
        }
        .vt-overlay-sub{font-size:15px;font-weight:800;color:var(--dim);text-align:center;animation:vtSlideUp .4s .15s both}
        .vt-overlay-voted-for{
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:12px 24px;
          box-shadow:var(--shadow-sm);
          font-size:16px;font-weight:800;
          animation:vtPop .4s .05s cubic-bezier(.34,1.56,.64,1) both;
          display:flex;align-items:center;gap:10px;
        }
        .vt-overlay-btn{
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif;font-size:22px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--terra2) 55%,var(--saffron) 140%);
          color:var(--paper);border:3px solid var(--ink);border-radius:16px;
          padding:16px;cursor:pointer;box-shadow:var(--shadow);
          transition:transform .12s,box-shadow .12s;
          animation:vtSlideUp .4s .2s both;
        }
        .vt-overlay-btn:hover{transform:translateY(-2px)}
        .vt-overlay-btn:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}

        @media(prefers-reduced-motion:reduce){.vt-root *{animation:none!important;transition:none!important}}
      `}),u.jsxs("div",{className:"vt-root",dir:"rtl",children:[u.jsxs("div",{className:"vt-header",children:[u.jsxs("div",{className:"vt-round-label",children:["الجولة ",e.roundNumber," · التصويت"]}),u.jsx("div",{className:"vt-title",children:"من المحتال؟ 🕵️"})]}),u.jsxs("div",{className:"vt-voter-badge",children:[u.jsx("span",{className:"vt-voter-dot",style:{backgroundColor:i.color}}),u.jsxs("span",{className:"vt-voter-name",children:["صوت ",i.name]})]}),u.jsx("div",{className:"vt-prog",children:u.jsx("div",{className:"vt-prog-fill",style:{width:`${e.votingIndex/e.players.length*100}%`}})}),u.jsx("div",{className:"vt-question",children:"🤔 من عندك برأيك هو اللي ما يعرفش الكلمة؟"}),u.jsx("div",{className:"vt-candidates",children:e.players.map(m=>{const x=m.id===i.id,w=n===m.id;return u.jsxs("button",{className:`vt-candidate ${w?"voted":""} ${x?"self-disabled":""}`,onClick:()=>s(m.id),disabled:!!n||x||a,"aria-label":x?"ما تقدرش تصوت على روحك":`صوت لـ ${m.name}`,children:[u.jsx("span",{className:"vt-candidate-dot",style:{backgroundColor:m.color}}),u.jsx("span",{className:"vt-candidate-name",children:m.name}),x&&u.jsx("span",{className:"vt-candidate-tag",children:"أنت"}),w&&u.jsx("span",{className:"vt-candidate-check",children:"✅"})]},m.id)})}),u.jsxs("div",{className:"vt-hint",children:[e.votingIndex+1," / ",e.players.length," صوّت"]}),l&&u.jsxs("div",{className:"vt-overlay",children:[u.jsx("div",{className:"vt-overlay-icon",children:"✅"}),u.jsxs("div",{className:"vt-overlay-title",children:["صوتت ",i.name,"!"]}),n&&(()=>{const m=e.players.find(x=>x.id===n);return u.jsxs("div",{className:"vt-overlay-voted-for",children:[u.jsx("span",{style:{width:14,height:14,borderRadius:"50%",border:"2px solid var(--ink)",backgroundColor:m==null?void 0:m.color,display:"inline-block"}}),"صوت على ",m==null?void 0:m.name]})})(),v?u.jsxs(u.Fragment,{children:[u.jsx("div",{className:"vt-overlay-sub",children:"الكل صوّت — يلا نشوفو المحتال!"}),u.jsx("button",{className:"vt-overlay-btn",onClick:f,children:"🎉 كشف النتيجة"})]}):u.jsxs(u.Fragment,{children:[u.jsxs("div",{className:"vt-overlay-sub",children:["مرر الجهاز لـ ",h==null?void 0:h.name]}),u.jsxs("button",{className:"vt-overlay-btn",onClick:f,children:["▶ التالي — ",h==null?void 0:h.name]})]})]})]})]}):null}function lp(e){const t=["#C8412B","#F2B23D","#1F7A6B","#3FBA9A","#E85C2A","#FFF9EC","#fff"];for(let n=0;n<70;n++){const r=document.createElement("div");r.style.cssText=`
      position:absolute;
      left:${Math.random()*100}%;
      top:-24px;
      width:${7+Math.random()*9}px;
      height:${10+Math.random()*10}px;
      border-radius:3px;
      background:${t[Math.floor(Math.random()*t.length)]};
      border:1.5px solid rgba(42,33,24,.3);
      animation:confFall ${1.6+Math.random()*1.8}s linear ${Math.random()*.9}s both;
      pointer-events:none;
      transform:rotate(${Math.random()*360}deg);
    `,e.appendChild(r),setTimeout(()=>r.remove(),4500)}}function op(){var s,f;const{state:e,dispatch:t}=dn(),[n,r]=T.useState("mystery"),l=T.useRef(null),o=e.players.find(v=>v.id===e.imposterId),i=[...e.players].sort((v,h)=>(e.scores[h.id]??0)-(e.scores[v.id]??0)),a=e.scores[(s=i[0])==null?void 0:s.id]??0;return T.useEffect(()=>{n==="reveal"&&e.imposterCaught&&l.current&&lp(l.current)},[n,e.imposterCaught]),T.useEffect(()=>{n==="scores"&&window.parent.postMessage({type:"game-over"},"*")},[n]),u.jsxs(u.Fragment,{children:[u.jsx("style",{children:`
        .rs-root {
          --paper:#F6EFE2; --card:#FFF9EC; --ink:#2A2118;
          --ink15:rgba(42,33,24,.15); --ink50:rgba(42,33,24,.55);
          --terra:#C8412B; --terra2:#E85C2A; --saffron:#F2B23D;
          --tea:#1F7A6B; --mint:#3FBA9A; --dim:#8A7A63;
          --shadow:0 4px 0 var(--ink); --shadow-sm:0 3px 0 var(--ink);
          background:var(--paper);
          min-height:100dvh;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center;
          padding:24px 20px calc(28px + env(safe-area-inset-bottom));
          gap:18px;
          font-family:'Cairo',system-ui,sans-serif;
          color:var(--ink);
          -webkit-user-select:none; user-select:none;
          position:relative; overflow:hidden;
        }
        .rs-root *{box-sizing:border-box}
        .rs-inner{width:100%;max-width:520px;display:flex;flex-direction:column;gap:16px}

        @keyframes confFall{
          0%{transform:translateY(-24px) rotate(0deg);opacity:1}
          100%{transform:translateY(105vh) rotate(720deg);opacity:0}
        }
        @keyframes rsPop{
          0%{opacity:0;transform:scale(.78) rotate(-3deg)}
          65%{transform:scale(1.06) rotate(.5deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes rsSlideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        @keyframes rsBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px) scale(1.02)}}
        @keyframes rsStamp{
          0%{opacity:0;transform:scale(1.6) rotate(-8deg)}
          60%{transform:scale(.92) rotate(.5deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes rsSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
        @keyframes rsPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}

        /* ── SHARED ── */
        .rs-btn{
          width:100%;
          font-family:'Lalezar','Cairo',sans-serif;font-size:22px;
          background:linear-gradient(135deg,var(--terra) 0%,var(--terra2) 55%,var(--saffron) 140%);
          color:var(--paper);border:3px solid var(--ink);border-radius:16px;
          padding:16px;cursor:pointer;box-shadow:var(--shadow);
          transition:transform .12s,box-shadow .12s;
        }
        .rs-btn:hover{transform:translateY(-2px)}
        .rs-btn:active{transform:translateY(2px);box-shadow:0 1px 0 var(--ink)}
        .rs-btn-ghost{
          width:100%;
          font-family:'Cairo',sans-serif;font-size:16px;font-weight:800;
          background:var(--card);border:3px solid var(--ink);border-radius:16px;
          padding:13px;cursor:pointer;box-shadow:var(--shadow-sm);color:var(--ink);
          transition:transform .12s;
        }
        .rs-btn-ghost:hover{transform:translateY(-2px)}
        .rs-btn-ghost:active{transform:translateY(1px)}

        /* ── MYSTERY PHASE ── */
        .rs-mystery{
          text-align:center;
          display:flex;flex-direction:column;align-items:center;gap:18px;
        }
        .rs-mystery-spies{font-size:56px;animation:rsPulse 2s ease-in-out infinite;letter-spacing:8px}
        .rs-mystery-title{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(28px,8vw,42px);
          color:var(--ink);
        }
        .rs-mystery-card{
          background:var(--card);border:3px dashed var(--ink50);
          border-radius:20px;padding:24px 20px;width:100%;
          box-shadow:var(--shadow-sm);
          display:flex;flex-direction:column;align-items:center;gap:12px;
        }
        .rs-mystery-ring{
          width:80px;height:80px;border-radius:50%;
          border:4px solid var(--ink);background:var(--paper);
          display:grid;place-items:center;font-size:36px;
          animation:rsSpin 8s linear infinite;
        }
        .rs-mystery-sub{font-size:16px;font-weight:800;color:var(--dim)}

        /* ── REVEAL PHASE ── */
        .rs-reveal{
          display:flex;flex-direction:column;align-items:center;gap:16px;
          text-align:center;
        }
        .rs-reveal-icon{font-size:64px;animation:rsStamp .5s cubic-bezier(.34,1.56,.64,1) both}
        .rs-reveal-banner{
          width:100%;border-radius:20px;border:3px solid var(--ink);
          box-shadow:var(--shadow);padding:20px;
          display:flex;flex-direction:column;align-items:center;gap:10px;
          animation:rsPop .5s cubic-bezier(.34,1.56,.64,1) both .1s;
        }
        .rs-reveal-banner.caught{background:linear-gradient(160deg,#E2F4E8,#D5F0DC)}
        .rs-reveal-banner.escaped{background:linear-gradient(160deg,#FFE6DA,#FFD9C7)}
        .rs-reveal-result{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(26px,7vw,36px);
          color:var(--ink);
        }
        .rs-reveal-imposter{
          display:flex;align-items:center;gap:8px;
          font-size:22px;font-weight:900;
        }
        .rs-reveal-dot{width:16px;height:16px;border-radius:50%;border:2.5px solid var(--ink)}
        .rs-reveal-word{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(32px,9vw,46px);
          background:linear-gradient(180deg,rgba(242,178,61,.55),rgba(242,178,61,.2));
          padding:4px 18px;border-radius:10px;transform:rotate(-1deg);
          display:inline-block;
          animation:rsPop .5s cubic-bezier(.34,1.56,.64,1) both .2s;
        }
        .rs-reveal-word-label{font-size:13px;font-weight:800;color:var(--dim)}

        /* ── GUESS PHASE ── */
        .rs-guess{
          display:flex;flex-direction:column;gap:14px;
        }
        .rs-guess-header{
          text-align:center;
          background:var(--card);border:3px solid var(--saffron);
          border-radius:16px;padding:14px 16px;box-shadow:var(--shadow-sm);
          animation:rsSlideUp .4s both;
        }
        .rs-guess-title{
          font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(20px,5vw,28px);
          color:var(--ink);margin-bottom:4px;
        }
        .rs-guess-sub{font-size:14px;font-weight:800;color:var(--dim)}
        .rs-guess-grid{
          display:grid;grid-template-columns:1fr 1fr;gap:8px;
          animation:rsSlideUp .4s .08s both;
        }
        .rs-guess-btn{
          width:100%;text-align:center;
          background:var(--card);border:3px solid var(--ink);
          border-radius:14px;padding:14px 10px;
          cursor:pointer;font-family:'Lalezar','Cairo',sans-serif;
          font-size:clamp(16px,4vw,22px);
          transition:border-color .15s,background .15s,transform .12s,box-shadow .12s;
          box-shadow:var(--shadow-sm);
        }
        .rs-guess-btn:hover{border-color:var(--terra);transform:translateY(-2px);box-shadow:var(--shadow)}
        .rs-guess-btn:active{transform:translateY(1px);box-shadow:0 1px 0 var(--ink)}
        .rs-guess-result{
          text-align:center;
          background:var(--card);border:3px solid var(--ink);
          border-radius:16px;padding:18px;box-shadow:var(--shadow-sm);
          animation:rsPop .5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .rs-guess-result-icon{font-size:48px;display:block;margin-bottom:8px}
        .rs-guess-result-text{font-size:18px;font-weight:900}

        /* ── SCORES PHASE ── */
        .rs-scores-box{
          background:var(--card);border:3px solid var(--ink);
          border-radius:16px;overflow:hidden;box-shadow:var(--shadow-sm);
          animation:rsSlideUp .4s both;
        }
        .rs-scores-head{
          background:var(--ink);color:var(--paper);
          padding:10px 16px;font-size:14px;font-weight:900;letter-spacing:.5px;
        }
        .rs-scores-table{width:100%;border-collapse:collapse}
        .rs-scores-table td{
          padding:11px 14px;border-bottom:2.5px dashed var(--ink15);
          font-weight:800;font-size:16px;color:var(--ink);
        }
        .rs-scores-table td.pts{
          text-align:left;color:var(--terra);font-weight:900;font-size:18px;
          font-variant-numeric:tabular-nums;white-space:nowrap;
        }
        .rs-scores-table tr:last-child td{border-bottom:0}
        .rs-scores-table tr.winner td{animation:rsBob 1.4s ease-in-out infinite}
        .rs-score-dot{width:12px;height:12px;border-radius:50%;border:2px solid var(--ink);display:inline-block;margin-left:6px}
        .rs-imp-tag{font-size:11px;color:var(--terra);font-weight:800;margin-right:4px}

        @media(prefers-reduced-motion:reduce){.rs-root *{animation:none!important;transition:none!important}}
      `}),u.jsx("div",{ref:l,"aria-hidden":"true",style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,overflow:"hidden"}}),u.jsx("div",{className:"rs-root",dir:"rtl",children:u.jsxs("div",{className:"rs-inner",children:[n==="mystery"&&u.jsxs("div",{className:"rs-mystery",children:[u.jsx("div",{className:"rs-mystery-spies",children:"🕵️🕵️🕵️"}),u.jsx("div",{className:"rs-mystery-title",children:"مين هو المحتال؟"}),u.jsxs("div",{className:"rs-mystery-card",children:[u.jsx("div",{className:"rs-mystery-ring",children:"🎭"}),u.jsx("div",{className:"rs-mystery-sub",children:"الجواب غير معلوم..."})]}),u.jsx("button",{className:"rs-btn",onClick:()=>r("reveal"),children:"🎭 كشف المحتال!"})]}),n==="reveal"&&u.jsxs("div",{className:"rs-reveal",children:[u.jsx("div",{className:"rs-reveal-icon",children:e.imposterCaught?"🎉":"😈"}),u.jsxs("div",{className:`rs-reveal-banner ${e.imposterCaught?"caught":"escaped"}`,children:[u.jsx("div",{className:"rs-reveal-result",children:e.imposterCaught?"تم كشف المحتال! 🎊":"المحتال هرب! 😈"}),u.jsxs("div",{className:"rs-reveal-imposter",children:[u.jsx("span",{className:"rs-reveal-dot",style:{backgroundColor:o==null?void 0:o.color}}),u.jsx("span",{children:o==null?void 0:o.name}),u.jsx("span",{style:{fontSize:14,color:"var(--dim)",fontWeight:800},children:"كان المحتال"})]})]}),e.guessedWords?u.jsx("button",{className:"rs-btn",onClick:()=>r("guess"),children:"🎯 خلّيه يخمن الكلمة!"}):u.jsx("button",{className:"rs-btn",onClick:()=>r("scores"),children:"🏆 شوف النقاط"})]}),n==="guess"&&u.jsx("div",{className:"rs-guess",children:e.guessCorrect===null?u.jsxs(u.Fragment,{children:[u.jsxs("div",{className:"rs-guess-header",children:[u.jsxs("div",{className:"rs-guess-title",children:["🎯 يا ",o==null?void 0:o.name,"، خمن الكلمة!"]}),u.jsx("div",{className:"rs-guess-sub",children:"اختر الكلمة الصحيحة من القائمة — نقطة إضافية إذا صح!"})]}),u.jsx("div",{className:"rs-guess-grid",children:(f=e.guessedWords)==null?void 0:f.map(v=>u.jsx("button",{className:"rs-guess-btn",onClick:()=>t({type:"GUESS_WORD",word:v}),children:v},v))})]}):u.jsxs(u.Fragment,{children:[u.jsxs("div",{className:"rs-guess-result",children:[u.jsx("span",{className:"rs-guess-result-icon",children:e.guessCorrect?"🏆":"❌"}),u.jsx("div",{className:"rs-guess-result-text",children:e.guessCorrect?`${o==null?void 0:o.name} خمّن صح! الكلمة هي "${e.secretWord}" 🎉`:`غلط — الكلمة كانت "${e.secretWord}"`})]}),u.jsx("button",{className:"rs-btn",onClick:()=>r("scores"),children:"🏆 شوف النقاط"})]})}),n==="scores"&&u.jsxs(u.Fragment,{children:[u.jsx("div",{style:{textAlign:"center",fontFamily:"'Lalezar','Cairo',sans-serif",fontSize:"clamp(26px,7vw,36px)"},children:"🏅 النقاط"}),u.jsxs("div",{className:"rs-scores-box",children:[u.jsxs("div",{className:"rs-scores-head",children:["الجولة ",e.roundNumber," — الترتيب"]}),u.jsx("table",{className:"rs-scores-table",children:u.jsx("tbody",{children:i.map((v,h)=>{const m=e.scores[v.id]??0,x=m===a&&a>0&&h===0;return u.jsxs("tr",{className:x?"winner":"",children:[u.jsxs("td",{children:[u.jsx("span",{className:"rs-score-dot",style:{backgroundColor:v.color}}),x&&"🥇 ",v.name,v.id===e.imposterId&&u.jsx("span",{className:"rs-imp-tag",children:"(المحتال)"})]}),u.jsxs("td",{className:"pts",children:[m," نقطة"]})]},v.id)})})})]}),u.jsx("button",{className:"rs-btn",onClick:()=>t({type:"PLAY_AGAIN"}),children:"🎮 جولة جديدة"}),u.jsx("button",{className:"rs-btn-ghost",onClick:()=>t({type:"RESET"}),children:"إعادة تعيين من الأول"})]})]})})]})}function ip(){const{state:e,dispatch:t}=dn(),[n,r]=T.useState(!1),[l,o]=T.useState(!1),i=n&&e.phase!=="setup";return u.jsxs(u.Fragment,{children:[u.jsx("style",{children:`
        .app-quit-btn {
          position: fixed; top: 16px; left: 16px; z-index: 50;
          width: 40px; height: 40px; border-radius: 12px;
          background: #FFF9EC; border: 2.5px solid #2A2118;
          color: #2A2118; font-size: 18px; font-weight: bold;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 3px 0 #2A2118;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .app-quit-btn:active {
          transform: translateY(2px); box-shadow: 0 1px 0 #2A2118;
        }
        .app-quit-modal {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(42,33,24,0.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; animation: qFade 0.2s;
        }
        .app-quit-box {
          background: #F6EFE2; border: 3px solid #2A2118;
          border-radius: 20px; padding: 24px; width: 100%; max-width: 320px;
          box-shadow: 0 8px 0 #2A2118; text-align: center;
          animation: qPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .app-quit-title {
          font-family: 'Lalezar', 'Cairo', sans-serif;
          font-size: 28px; color: #C8412B; margin-bottom: 8px;
        }
        .app-quit-text {
          font-family: 'Cairo', sans-serif; font-size: 15px; font-weight: 800;
          color: #8A7A63; margin-bottom: 24px;
        }
        .app-quit-row { display: flex; gap: 12px; }
        .app-quit-yes {
          flex: 1; font-family: 'Lalezar', 'Cairo', sans-serif; font-size: 20px;
          background: #C8412B; color: #F6EFE2; border: 2.5px solid #2A2118;
          border-radius: 12px; padding: 10px; cursor: pointer;
          box-shadow: 0 3px 0 #2A2118;
        }
        .app-quit-no {
          flex: 1; font-family: 'Lalezar', 'Cairo', sans-serif; font-size: 20px;
          background: #FFF9EC; color: #2A2118; border: 2.5px solid #2A2118;
          border-radius: 12px; padding: 10px; cursor: pointer;
          box-shadow: 0 3px 0 #2A2118;
        }
        @keyframes qFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes qPop { from { transform: scale(0.9); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}),n?u.jsxs(u.Fragment,{children:[e.phase==="setup"&&u.jsx(Jf,{}),e.phase==="roleReveal"&&u.jsx(ep,{}),e.phase==="drawing"&&u.jsx(np,{}),e.phase==="voting"&&u.jsx(rp,{}),e.phase==="resolution"&&u.jsx(op,{})]}):u.jsx(qf,{onStart:()=>r(!0)}),i&&u.jsx("button",{className:"app-quit-btn",onClick:()=>o(!0),"aria-label":"خروج",children:"✕"}),l&&u.jsx("div",{className:"app-quit-modal",dir:"rtl",children:u.jsxs("div",{className:"app-quit-box",children:[u.jsx("div",{className:"app-quit-title",children:"بغيتي تخرج؟"}),u.jsx("div",{className:"app-quit-text",children:"كل النقاط غادي تمشي وتعاودو من الأول. متأكد؟"}),u.jsxs("div",{className:"app-quit-row",children:[u.jsx("button",{className:"app-quit-no",onClick:()=>o(!1),children:"لا، كمل"}),u.jsx("button",{className:"app-quit-yes",onClick:()=>{o(!1),r(!1),t({type:"RESET"})},children:"آه، نخرج"})]})]})})]})}ic(document.getElementById("root")).render(u.jsx(T.StrictMode,{children:u.jsx(Zf,{children:u.jsx(ip,{})})}));
