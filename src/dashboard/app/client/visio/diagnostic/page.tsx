'use client';

import AudioDiagnostic from '../../../../components/AudioDiagnostic';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../../lib/page-styles';
import { useIsMobile } from '../../../../lib/use-media-query';
import { PAGE_META } from '../../../../lib/emoji-map';
import PageExplanation from '../../../../components/PageExplanation';

export default function DiagnosticPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['visio'];

  return (
    <div style={pageContainer(isMobile)}>
      <div style={headerRow()}>
        <span style={emojiIcon(24)}>🔊</span>
        <div>
          <h1 style={CU.pageTitle}>Diagnostic Audio</h1>
          <p style={CU.pageSubtitle}>Testez votre micro et haut-parleurs</p>
        </div>
        <PageExplanation
          pageId="visio-diagnostic"
          text="Testez le bon fonctionnement de votre microphone et de vos haut-parleurs avant de lancer un appel vocal."
        />
      </div>
      <AudioDiagnostic />
    </div>
  );
}
