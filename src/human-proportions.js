/**
 * Human proportion solver shared by procedural geometry and the animation rig.
 * Values are normalized against a neutral standing reference character.
 */
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export function solveHumanProportions(input={}) {
  const p={
    height:clamp(input.height??1,.8,1.2),
    shoulderWidth:clamp(input.shoulderWidth??1,.7,1.35),
    torsoLength:clamp(input.torsoLength??1,.8,1.2),
    bodyDepth:clamp(input.bodyDepth??1,.75,1.3),
    waistWidth:clamp(input.waistWidth??1,.7,1.35),
    hipWidth:clamp(input.hipWidth??1,.7,1.4),
    armLength:clamp(input.armLength??1,.8,1.2),
    legLength:clamp(input.legLength??1,.8,1.2),
    headScale:clamp(input.headScale??1,.8,1.2),
    neckLength:clamp(input.neckLength??1,.7,1.3)
  };
  const shoulderHalf=.405*p.shoulderWidth;
  const hipHalf=.205*p.hipWidth;
  const torsoTop=.28*p.torsoLength;
  const pelvisY=-.62*p.torsoLength;
  const shoulderY=.19*p.torsoLength;
  const elbowY=shoulderY-.42*p.armLength;
  const wristY=shoulderY-.82*p.armLength;
  const hipY=pelvisY-.06*p.torsoLength;
  const kneeY=hipY-.43*p.legLength;
  const ankleY=hipY-.84*p.legLength;
  return Object.freeze({
    ...p,
    landmarks:Object.freeze({
      crownY:1.12+(p.neckLength-1)*.14+.72*p.headScale,
      neckBaseY:.52*p.neckLength,
      shoulderY,
      shoulderHalf,
      elbowY,
      wristY,
      pelvisY,
      hipY,
      hipHalf,
      kneeY,
      ankleY,
      footY:ankleY-.045,
      torsoTop,
      torsoBottom:pelvisY
    })
  });
}
