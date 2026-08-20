import React from "react";
import { Composition, Still } from "remotion";
import { TrueGuardCommercial, TrueGuardPoster, TrueGuardVertical } from "./TrueGuardCommercial";

export const Root: React.FC = () => (
  <>
    <Composition id="TrueGuard30" component={TrueGuardCommercial} durationInFrames={720} fps={24} width={1920} height={1080} />
    <Composition id="TrueGuardVertical15" component={TrueGuardVertical} durationInFrames={360} fps={24} width={1080} height={1920} />
    <Still id="TrueGuardPoster" component={TrueGuardPoster} width={1920} height={1080} />
  </>
);
