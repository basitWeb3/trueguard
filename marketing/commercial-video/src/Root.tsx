import React from "react";
import { Composition, Still } from "remotion";
import { TrueGuardCommercial, TrueGuardPoster, TrueGuardVertical } from "./TrueGuardCommercial";
import { TrueGuardImpact, TrueGuardImpactCover } from "./TrueGuardImpact";

export const Root: React.FC = () => (
  <>
    <Composition id="TrueGuard30" component={TrueGuardCommercial} durationInFrames={720} fps={24} width={1920} height={1080} />
    <Composition id="TrueGuardVertical15" component={TrueGuardVertical} durationInFrames={360} fps={24} width={1080} height={1920} />
    <Composition id="TrueGuardImpact40" component={TrueGuardImpact} durationInFrames={960} fps={24} width={1920} height={1080} />
    <Still id="TrueGuardPoster" component={TrueGuardPoster} width={1920} height={1080} />
    <Still id="TrueGuardImpactCover" component={TrueGuardImpactCover} width={1920} height={1080} />
  </>
);
