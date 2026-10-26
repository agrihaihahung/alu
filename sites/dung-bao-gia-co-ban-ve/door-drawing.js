/* ============================================================
   DOOR DRAWING ENGINE — TRƯỢT QUAY
   Hình tự co giãn theo tỷ lệ W/H nhập vào; có kích thước ngang và cao.
   API: DoorDrawing.render({svg, width, height, system})
   ============================================================ */
(function(global){
  'use strict';
  const STYLE = {
    frame:'#aeb2b1', frameEdge:'#666d70', glass:'#adf4e9',
    glassAlt:'#a9eee9', movement:'#3978b8', handle:'#182235',
    outline:'#60696b', dimension:'#34495e'
  };
  const GEOMETRY = {
    viewBox:{width:800,height:600},
    // Vùng tối đa dành cho khung cửa, chừa lề cho đường kích thước.
    fit:{left:90,top:70,width:640,height:450},
    frame:{left:15,right:15,top:15,bottom:15},
    twoLeaf:{meetingGap:7}, fourLeaf:{meetingGap:8},
    handleHeightRatio:0.16, handleWidth:8, dimensionOffset:25
  };
  function rect(x,y,w,h,fill,stroke=STYLE.frameEdge,sw=1,extra=''){
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
  }
  function line(x1,y1,x2,y2,stroke=STYLE.frameEdge,sw=1,extra=''){
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
  }
  function polygon(points,fill,stroke=STYLE.frameEdge,sw=1){
    return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  }
  function drawOuterFrame(x,y,w,h){
    let s=rect(x,y,w,h,STYLE.frame,STYLE.frameEdge,1.3);
    const c=Math.min(15,w*.06,h*.06);
    s+=polygon(`${x},${y} ${x+c},${y+c} ${x+c},${y+h-c} ${x},${y+h}`,'#b6bab9');
    s+=polygon(`${x+w},${y} ${x+w-c},${y+c} ${x+w-c},${y+h-c} ${x+w},${y+h}`,'#b6bab9');
    s+=polygon(`${x},${y} ${x+c},${y+c} ${x+w-c},${y+c} ${x+w},${y}`,'#c1c5c4');
    s+=polygon(`${x},${y+h} ${x+c},${y+h-c} ${x+w-c},${y+h-c} ${x+w},${y+h}`,'#b4b8b7');
    s+=line(x+c,y+c,x+w-c,y+c,'#7b8282',.7);
    s+=line(x+c,y+h-c,x+w-c,y+h-c,'#7b8282',.7);
    return s;
  }
  function drawHandle(x,y,h,side){
    const hh=Math.min(86,h*.23), hw=8, top=y+(h-hh)/2;
    const xx=side==='left'?x+2:x-2-hw;
    // Tay nắm cách điệu theo ảnh mẫu.
    return `<path d="M${xx} ${top} l${hw} 0 l0 ${hh*.18} q0 5 -3 9 l0 ${hh*.46} q0 5 3 9 l0 ${hh*.18} l-${hw} 0 l0 -${hh*.18} q0 -5 3 -9 l0 -${hh*.46} q0 -5 -3 -9 Z" fill="${STYLE.handle}" stroke="${STYLE.handle}" stroke-width=".8"/>`;
  }
  function drawLeaf(x,y,w,h,opts={}){
    const b=Math.max(5,Math.min(11,w*.045,h*.025));
    let s=rect(x,y,w,h,STYLE.frame,STYLE.frameEdge,1.1);
    s+=rect(x+b,y+b,w-2*b,h-2*b,opts.glass||STYLE.glass,'#687273',.8);
    s+=rect(x+b+3,y+b+3,w-2*(b+3),h-2*(b+3),'none','#c2c7c6',.55);
    const inset=Math.max(4,b);
    if(opts.movement==='chevron-right'){
      s+=line(x+inset,y+inset,x+w-inset,y+h*.5,STYLE.movement,1.2);
      s+=line(x+w-inset,y+h*.5,x+inset,y+h-inset,STYLE.movement,1.2);
    } else if(opts.movement==='chevron-left'){
      s+=line(x+w-inset,y+inset,x+inset,y+h*.5,STYLE.movement,1.2);
      s+=line(x+inset,y+h*.5,x+w-inset,y+h-inset,STYLE.movement,1.2);
    } else if(opts.movement==='arrow-left'||opts.movement==='arrow-right'){
      const cy=y+h*.5, len=Math.min(w*.42,58), cx=x+w*.5, dir=opts.movement==='arrow-right'?1:-1;
      const tipX=cx+dir*len*.48, startX=cx-dir*len*.48, tip=8;
      s+=line(startX,cy,tipX,cy,STYLE.movement,1.7);
      if(dir===1)s+=polygon(`${tipX},${cy} ${tipX-tip},${cy-tip*.75} ${tipX-tip},${cy+tip*.75}`,STYLE.movement,STYLE.movement,.5);
      else s+=polygon(`${tipX},${cy} ${tipX+tip},${cy-tip*.75} ${tipX+tip},${cy+tip*.75}`,STYLE.movement,STYLE.movement,.5);
    }
    if(opts.handle)s+=drawHandle(opts.handleSide==='left'?x:x+w,y,h,opts.handleSide||'left');
    return s;
  }
  function drawTwoLeaf(x,y,w,h){
    const gap=GEOMETRY.twoLeaf.meetingGap, leafW=(w-gap)/2;
    let s=drawLeaf(x,y,leafW,h,{movement:'arrow-left',handle:true,handleSide:'left'});
    s+=drawLeaf(x+leafW+gap,y,leafW,h,{movement:'chevron-left'});
    s+=rect(x+leafW-3,y,gap+6,h,STYLE.frame,STYLE.frameEdge,1.1);
    s+=line(x+leafW+1,y+3,x+leafW+1,y+h-3,'#6e7575',.8);
    // Mũi tên cánh trái được vẽ nổi phía trên thanh giữa.
    const cy=y+h*.5,cx=x+leafW*.5,len=Math.min(leafW*.42,58),tip=8;
    s+=line(cx+len*.45,cy,cx-len*.45,cy,STYLE.movement,1.7);
    s+=polygon(`${cx-len*.45},${cy} ${cx-len*.45+tip},${cy-tip*.8} ${cx-len*.45+tip},${cy+tip*.8}`,STYLE.movement,STYLE.movement,.5);
    return s;
  }
  function drawFourLeaf(x,y,w,h){
    const gap=GEOMETRY.fourLeaf.meetingGap, leafW=(w-3*gap)/4;
    let s='';
    const movement=['chevron-left','arrow-right','arrow-left','chevron-right'];
    for(let i=0;i<4;i++){
      s+=drawLeaf(x+i*(leafW+gap),y,leafW,h,{movement:movement[i],glass:(i===1||i===2)?STYLE.glassAlt:STYLE.glass});
    }
    const cy=y+h*.5, hh=Math.min(86,h*.23), hw=8, center=x+2*leafW+1.5*gap;
    s+=rect(center-gap*.6-hw/2,cy-hh/2,hw,hh,STYLE.handle,STYLE.handle,.7);
    s+=rect(center+gap*.6-hw/2,cy-hh/2,hw,hh,STYLE.handle,STYLE.handle,.7);
    return s;
  }
  function render(config){
    const svg=config.svg, w=Math.max(100,Number(config.width)||2800), h=Math.max(100,Number(config.height)||2400);
    const system=config.system||{}, panels=Number(system.panels)||2;
    const vb=GEOMETRY.viewBox, fit=GEOMETRY.fit;
    // Tỷ lệ khung trên hình luôn theo W/H. Fit vào vùng có sẵn mà không làm méo cửa.
    const aspect=w/h;
    let frameW=fit.width, frameH=frameW/aspect;
    if(frameH>fit.height){frameH=fit.height;frameW=frameH*aspect;}
    // Cực trị rất dài/hẹp vẫn nằm trong vùng vẽ.
    frameW=Math.max(70,frameW); frameH=Math.max(90,frameH);
    const x=fit.left+(fit.width-frameW)/2, y=fit.top+(fit.height-frameH)/2;
    const fx=x+GEOMETRY.frame.left, fy=y+GEOMETRY.frame.top;
    const fw=frameW-GEOMETRY.frame.left-GEOMETRY.frame.right;
    const fh=frameH-GEOMETRY.frame.top-GEOMETRY.frame.bottom;
    let out=`<rect x="0" y="0" width="${vb.width}" height="${vb.height}" fill="#fff"/>`;
    // Kích thước ngang: đường dóng và số liệu trên đầu cửa.
    const dimY=y-18;
    out+=line(x,dimY,x+frameW,dimY,STYLE.dimension,1,'stroke-dasharray="3 2"');
    out+=line(x,dimY-5,x,dimY+5,STYLE.dimension,1);
    out+=line(x+frameW,dimY-5,x+frameW,dimY+5,STYLE.dimension,1);
    out+=`<text x="${x+frameW/2}" y="${dimY-7}" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#172033">${w} mm</text>`;
    // Kích thước cao: đường dóng và số liệu xoay dọc bên trái.
    const dimX=x-25;
    out+=line(dimX,y,dimX,y+frameH,STYLE.dimension,1,'stroke-dasharray="3 2"');
    out+=line(dimX-5,y,dimX+5,y,STYLE.dimension,1);
    out+=line(dimX-5,y+frameH,dimX+5,y+frameH,STYLE.dimension,1);
    out+=`<text x="${dimX-8}" y="${y+frameH/2}" text-anchor="middle" transform="rotate(-90 ${dimX-8} ${y+frameH/2})" font-family="Arial,sans-serif" font-size="15" font-weight="700" fill="#172033">${h} mm</text>`;
    out+=drawOuterFrame(x,y,frameW,frameH);
    out+=rect(fx,fy,fw,fh,STYLE.frame,STYLE.frameEdge,1);
    const inset=Math.min(8,fw*.025,fh*.025), ix=fx+inset,iy=fy+inset,iw=fw-2*inset,ih=fh-2*inset;
    if(system.fix){
      // Ô fix phía trên: 1 khoang với cửa 2 cánh; 3 khoang với cửa 4 cánh.
      const fixH=Math.max(42,Math.min(ih*.19,ih-100));
      const fixPaneY=iy, fixPaneH=fixH-inset*.45;
      out+=rect(ix+2,fixPaneY+2,iw-4,fixPaneH-2,STYLE.glass,'#687273',.9);
      out+=rect(ix+6,fixPaneY+6,iw-12,fixPaneH-10,'none','#c2c7c6',.55);
      const divisions=panels===4?3:1;
      for(let i=1;i<divisions;i++){
        const dx=ix+iw*i/divisions;
        out+=rect(dx-4,fixPaneY,8,fixPaneH,STYLE.frame,STYLE.frameEdge,.9);
        out+=line(dx,fixPaneY+2,dx,fixPaneY+fixPaneH-2,'#747b7b',.65);
      }
      const transomY=iy+fixH;
      out+=rect(fx,transomY-3,fw,7,STYLE.frame,STYLE.frameEdge,1);
      const doorY=transomY+4, doorH=iy+ih-doorY;
      if(panels===4)out+=drawFourLeaf(ix,doorY,iw,doorH);else out+=drawTwoLeaf(ix,doorY,iw,doorH);
    } else {
      if(panels===4)out+=drawFourLeaf(ix,iy,iw,ih);else out+=drawTwoLeaf(ix,iy,iw,ih);
    }
    svg.setAttribute('viewBox',`0 0 ${vb.width} ${vb.height}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.innerHTML=out;
    return {width:w,height:h,panels,aspect};
  }
  global.DoorDrawing={render,STYLE,GEOMETRY};
})(window);
