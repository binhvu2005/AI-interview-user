// File này: Bộ tiện ích xử lý Giọng đọc AI thông minh (Smart AI Text-to-Speech Helper).
// Vai trò: 
// 1. Tự động phát hiện và chọn giọng đọc AI tự nhiên, mềm mại, truyền cảm nhất (Microsoft Natural Online trên Edge, Google Neural trên Chrome).
// 2. Làm sạch mã nguồn/markdown (loại bỏ code snippet, backtick, ký tự thô để tránh đọc từng ký tự gây giật cục).
// 3. Chuẩn hóa ngữ âm thuật ngữ kỹ thuật tiếng Anh (API, React, SQL, Docker, Redis, Cache, useEffect...) sang âm tiết tự nhiên để bộ đọc tiếng Việt phát âm chuẩn xác, không bị nuốt âm hay vấp.
// 4. Cung cấp bộ điều khiển tốc độ (rate) và cao độ (pitch) chuẩn hóa giúp giọng đọc êm ái, từ tốn như chuyên gia phỏng vấn thực thụ.
// Khi nào dùng: Được gọi trong màn hình phỏng vấn (InterviewPage) khi AI phát câu hỏi mới hoặc người dùng bấm nút nghe lại.

/**
 * Bản đồ phiên âm ngữ âm các thuật ngữ CNTT phổ biến khi đọc bằng giọng tiếng Việt.
 * Sử dụng khoảng trắng giữa các âm tiết thay vì dấu gạch nối để tránh việc một số bộ TTS đọc thành chữ "gạch nối".
 */
const TECH_PRONUNCIATION_MAP: [RegExp, string][] = [
  // 1. Viết tắt phổ biến (Acronyms)
  [/\bAPIs\b/gi, 'Ây Pi Ai'],
  [/\bAPI\b/gi, 'Ây Pi Ai'],
  [/\bRESTful\b/gi, 'Rét-s phun'],
  [/\bREST\b/gi, 'Rét-s'],
  [/\bUI\b/gi, 'U Ai'],
  [/\bUX\b/gi, 'U Ích'],
  [/\bAI\b/gi, 'Ây Ai'],
  [/\bCI\/CD\b/gi, 'Xi Ai Xi Đi'],
  [/\bSQL\b/gi, 'Ét Kiu En'],
  [/\bNoSQL\b/gi, 'Nô Ét Kiu En'],
  [/\bHTML5?\b/gi, 'Hát Tê Mờ Lờ'],
  [/\bCSS3?\b/gi, 'Xi Ét Ét'],
  [/\bJS\b/gi, 'J Éch'],
  [/\bTS\b/gi, 'Tê Éch'],
  [/\bJSON\b/gi, 'J sơn'],
  [/\bJWT\b/gi, 'J Đắp-lưu Tê'],
  [/\bOOP\b/gi, 'Ô Ô Pê'],
  [/\bDOM\b/gi, 'Đom'],
  [/\bSSR\b/gi, 'Éch Éch R'],
  [/\bCSR\b/gi, 'Xi Éch R'],
  [/\bSSG\b/gi, 'Éch Éch G'],
  [/\bAWS\b/gi, 'Ây Đắp-lưu Éch'],
  [/\bGCP\b/gi, 'Gi Si Pi'],
  [/\bSDK\b/gi, 'Éch Đi Kê'],
  [/\bHTTPS?\b/gi, 'Hát Tê Tê Pê'],
  [/\bURL\b/gi, 'U R L'],
  [/\bURI\b/gi, 'U R I'],
  [/\bCRUD\b/gi, 'Cờ-rút'],
  [/\bORM\b/gi, 'O R M'],
  [/\bCORS\b/gi, 'Coóc'],
  [/\bCSRF\b/gi, 'Xi Éch R Ph'],
  [/\bXSS\b/gi, 'Ích Éch Éch'],
  [/\bDNS\b/gi, 'Đê En Éch'],
  [/\bIP\b/gi, 'Ai Pi'],
  [/\bTCP\b/gi, 'Tê Xê Pê'],
  [/\bUDP\b/gi, 'U Đê Pê'],
  [/\bgRPC\b/gi, 'Gi Rờ Pê Xê'],
  [/\bRPC\b/gi, 'Rờ Pê Xê'],
  [/\bN\+1\b/gi, 'En cộng một'],
  [/\bUUID\b/gi, 'U U I D'],

  // 2. Frameworks & Ngôn ngữ lập trình
  [/\bReact\.?js\b/gi, 'Ri ách'],
  [/\bReact\b/gi, 'Ri ách'],
  [/\bRedux\b/gi, 'Ri đắc'],
  [/\bNext\.?js\b/gi, 'Nếch J Éch'],
  [/\bVue\.?js\b/gi, 'Viu J Éch'],
  [/\bVue\b/gi, 'Viu'],
  [/\bAngular\b/gi, 'An-gu-la'],
  [/\bSvelte\b/gi, 'Sờ-ven-tơ'],
  [/\bNode\.?js\b/gi, 'Nốt J Éch'],
  [/\bExpress\.?js\b/gi, 'Éch pờ rét'],
  [/\bNest\.?js\b/gi, 'Nét-s J Éch'],
  [/\bTypeScript\b/gi, 'Típ sờ cờ ríp'],
  [/\bJavaScript\b/gi, 'Gia va sờ cờ ríp'],
  [/\bPython\b/gi, 'Pai thần'],
  [/\bGolang\b/gi, 'Gô lang'],
  [/\bDocker\b/gi, 'Đốc cơ'],
  [/\bDockerized?\b/gi, 'Đốc cơ hóa'],
  [/\bKubernetes\b/gi, 'Cu bơ ne tít'],
  [/\bK8s\b/gi, 'Kê Tám Éch'],
  [/\bRedis\b/gi, 'Rê đít'],
  [/\bKafka\b/gi, 'Cáp ca'],
  [/\bRabbitMQ\b/gi, 'Ráp bít Em Kiu'],
  [/\bGraphQL\b/gi, 'Gờ ráp Kiu En'],
  [/\bSpring Boot\b/gi, 'Sờ pring Bút'],
  [/\bDjango\b/gi, 'Đi-gian-gô'],
  [/\bFastAPI\b/gi, 'Phát-s Ây Pi Ai'],
  [/\bLaravel\b/gi, 'La-ra-veo'],
  [/\bPostgreSQL\b/gi, 'Pốt gờ rét Ét Kiu En'],
  [/\bPostgres\b/gi, 'Pốt gờ rét'],
  [/\bMySQL\b/gi, 'Mai Ét Kiu En'],
  [/\bMongoDB\b/gi, 'Mông gô Đi Bi'],
  [/\bElasticsearch\b/gi, 'I-lát-s-tích Sớt'],
  [/\bTailwindCSS\b/gi, 'Têu-uyn Xi Ét Ét'],
  [/\bTailwind\b/gi, 'Têu-uyn'],

  // 3. React & Frontend Core Concepts
  [/\buseEffects?\b/gi, 'Diu Ít phéc'],
  [/\buseMemos?\b/gi, 'Diu Mê mô'],
  [/\buseStates?\b/gi, 'Diu Sờ tây t'],
  [/\buseCallbacks?\b/gi, 'Diu Côn bách'],
  [/\buseRefs?\b/gi, 'Diu Rép'],
  [/\buseContexts?\b/gi, 'Diu Cơn tếch-s'],
  [/\bHooks?\b/gi, 'Húc'],
  [/\bProps?\b/gi, 'Pờ róp'],
  [/\bComponents?\b/gi, 'Côm pô nơn'],
  [/\bRe-renders?\b/gi, 'Ri ren đơ'],
  [/\bRerenders?\b/gi, 'Ri ren đơ'],
  [/\bRender\b/gi, 'Ren đơ'],
  [/\bRendering\b/gi, 'Ren đơ ring'],
  [/\bVirtual DOM\b/gi, 'Vơ truồi Đom'],
  [/\bHydration\b/gi, 'Hai đrây sơn'],
  [/\bState\b/gi, 'Sờ tây t'],

  // 4. Kiến trúc & Vận hành (System Architecture & Operations)
  [/\bMicroservices?\b/gi, 'Mai crô sơ vít'],
  [/\bMonolith(ic)?\b/gi, 'Mô nô lít'],
  [/\bFrontend\b/gi, 'Phờ ron ten'],
  [/\bBackend\b/gi, 'Bách en'],
  [/\bFullstack\b/gi, 'Phun stắc'],
  [/\bDevOps\b/gi, 'Đép Óp'],
  [/\bMiddleware\b/gi, 'Mít đồ ue'],
  [/\bFramework\b/gi, 'Phờ rem uốc'],
  [/\bLibrary\b/gi, 'Lai brơ ri'],
  [/\bAsync\b/gi, 'A sinh'],
  [/\bAwait\b/gi, 'Ơ uây'],
  [/\bPromises?\b/gi, 'Pờ ro mít'],
  [/\bDatabases?\b/gi, 'Đa ta bây'],
  [/\bQueries\b/gi, 'Kiu ri'],
  [/\bQuery\b/gi, 'Kiu ri'],
  [/\bIndexing\b/gi, 'In đếch sing'],
  [/\bIndex\b/gi, 'In đếch'],
  [/\bCaching\b/gi, 'Két sing'],
  [/\bCached?\b/gi, 'Két'],
  [/\bLatency\b/gi, 'Lây tơn xi'],
  [/\bThroughput\b/gi, 'Thơ rút pút'],
  [/\bScalability\b/gi, 'Sờ kêu la bi li ti'],
  [/\bScale\b/gi, 'Sờ kêu'],
  [/\bHigh Availability\b/gi, 'Hai Ơ vây lơ bi li ti'],
  [/\bLoad Balancers?\b/gi, 'Lốt Ba lân sơ'],
  [/\bReverse Proxy\b/gi, 'Ri vớt Pờ róc xi'],
  [/\bRace Conditions?\b/gi, 'Rây-s Cơn đi sơn'],
  [/\bDeadlocks?\b/gi, 'Đét lốc'],
  [/\bMemory Leaks?\b/gi, 'Me mô ri Líc'],
  [/\bBugs?\b/gi, 'Bấc'],
  [/\bDebug(ging)?\b/gi, 'Đi bấc'],
  [/\bClean Code\b/gi, 'Clin Cốt'],
  [/\bRefactor(ing)?\b/gi, 'Ri phắc tờ'],
  [/\bThreads?\b/gi, 'Thơ rét'],
  [/\bMulti-threads?\b/gi, 'Man ti Thơ rét'],
  [/\bGit\b/gi, 'Gít'],
  [/\bGitHub\b/gi, 'Gít Hắp'],
  [/\bGitLab\b/gi, 'Gít Láp'],
  [/\bCommit\b/gi, 'Com mít'],
  [/\bBranch\b/gi, 'Bờ ranh'],
  [/\bMerge\b/gi, 'Mợt gi'],
  [/\bPull Request\b/gi, 'Pun Ri quét'],
  [/\bUnit Tests?\b/gi, 'U nít Tét'],
  [/\bIntegration Tests?\b/gi, 'In tê gờ rây sơn Tét'],
  [/\bSeniors?\b/gi, 'Xi ni ơ'],
  [/\bJuniors?\b/gi, 'Giu ni ơ'],
  [/\bMiddle\b/gi, 'Mít đồ'],
  [/\bLeaders?\b/gi, 'Lí đờ'],
  [/\bManager\b/gi, 'Man ne giơ'],
];

// Bộ nhớ đệm danh sách giọng nói được hỗ trợ từ trình duyệt
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Làm sạch văn bản trước khi đưa vào bộ phát âm (TTS)
 * - Loại bỏ toàn bộ các khối code (``` ... ```) và thay bằng lời dẫn lịch sự.
 * - Loại bỏ các ký tự Markdown thô (*, #, >, `).
 * - Phiên âm từ ngữ kỹ thuật tiếng Anh sang ngữ âm tự nhiên khi đọc bằng tiếng Việt.
 */
export const cleanTextForSpeech = (rawText: string, isVi: boolean): string => {
  if (!rawText) return '';

  let text = rawText;

  // 1. Tách và thay thế các khối code (``` ... ```) thành câu dẫn tự nhiên
  text = text.replace(/```[\s\S]*?```/g, () => {
    return isVi
      ? ' Đoạn mã code mẫu được hiển thị chi tiết trên màn hình. '
      : ' The code snippet is displayed on your screen. ';
  });

  // 2. Làm sạch inline code `code`
  text = text.replace(/`([^`]+)`/g, '$1');

  // 3. Loại bỏ ký hiệu định dạng Markdown (*, **, #, >, [link])
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/#{1,6}\s+/g, '');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/^[*-]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');
  text = text.replace(/>\s*/g, '');

  // 4. Phiên âm các thuật ngữ CNTT tiếng Anh sang ngữ âm đọc tự nhiên khi đọc bằng tiếng Việt
  if (isVi) {
    for (const [pattern, replacement] of TECH_PRONUNCIATION_MAP) {
      text = text.replace(pattern, replacement);
    }
  }

  // 5. Chuẩn hóa khoảng trắng và dấu câu
  text = text.replace(/\s+/g, ' ').trim();

  return text;
};

/**
 * Chọn giọng đọc AI tốt nhất từ trình duyệt
 * Ưu tiên:
 * 1. Microsoft Natural Online voices (trên Edge): HoaiMy / NamMinh (Tiếng Việt) & Jenny / Christopher (Tiếng Anh)
 * 2. Google Neural voices (trên Chrome): Google Tiếng Việt / Google US English
 * 3. Fallback bất kỳ giọng hỗ trợ ngôn ngữ tương ứng
 */
export const getBestVoice = (isVi: boolean): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (isVi) {
    // 1. Ưu tiên giọng Microsoft Natural Online trên Edge (HoaiMy hoặc NamMinh)
    const edgeNatural = voices.find(v =>
      v.lang.startsWith('vi') &&
      (v.name.includes('HoaiMy') || v.name.includes('NamMinh') || (v.name.includes('Natural') && v.name.includes('Online')))
    );
    if (edgeNatural) return edgeNatural;

    // 2. Giọng Google Tiếng Việt trên Chrome
    const googleVi = voices.find(v => v.lang.startsWith('vi') && v.name.includes('Google'));
    if (googleVi) return googleVi;

    // 3. Bất kỳ giọng nào có nhãn Natural hoặc Neural
    const neuralVi = voices.find(v =>
      v.lang.startsWith('vi') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online'))
    );
    if (neuralVi) return neuralVi;

    // 4. Giọng tiếng Việt bất kỳ (ví dụ: Microsoft An)
    const anyVi = voices.find(v => v.lang.startsWith('vi'));
    if (anyVi) return anyVi;
  } else {
    // Tiếng Anh: Ưu tiên giọng Natural/Neural
    const edgeNaturalEn = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Jenny') || v.name.includes('Christopher') || v.name.includes('Guy') || v.name.includes('Aria') || (v.name.includes('Natural') && v.name.includes('Online')))
    );
    if (edgeNaturalEn) return edgeNaturalEn;

    const googleEn = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
    if (googleEn) return googleEn;

    const neuralEn = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Online'))
    );
    if (neuralEn) return neuralEn;

    const anyEn = voices.find(v => v.lang.startsWith('en'));
    if (anyEn) return anyEn;
  }

  return null;
};

export interface SpeakOptions {
  isVi: boolean;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Phát âm thanh giọng đọc mềm mại, truyền cảm và rõ ràng
 */
export const speakNatural = (text: string, options: SpeakOptions): void => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Hủy lời đọc đang dở trước đó
  window.speechSynthesis.cancel();

  // Chuẩn hóa và làm sạch nội dung câu hỏi
  const cleanedText = cleanTextForSpeech(text, options.isVi);
  if (!cleanedText) return;

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = options.isVi ? 'vi-VN' : 'en-US';

  // Tốc độ chuẩn: 0.94 là tốc độ vàng giúp phát âm mềm mại, trầm ấm và tròn vành rõ chữ
  utterance.rate = options.rate ?? 0.94;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  const voice = getBestVoice(options.isVi);
  if (voice) {
    utterance.voice = voice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
};

/**
 * Ngắt lời đọc ngay lập tức
 */
export const stopSpeech = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
