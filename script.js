class SpeechRecognitionApp {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.lastResultIndex = 0;
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.setupEventListeners();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.languageSelect = document.getElementById('language');
        this.statusElement = document.getElementById('status');
        this.confidenceElement = document.getElementById('confidence');
        this.outputTextElement = document.getElementById('outputText');
    }

    initializeSpeechRecognition() {
        // Web Speech APIの対応チェック
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('お使いのブラウザは音声認識をサポートしていません。Chrome、Safari、またはEdgeをお使いください。');
            return;
        }

        // SpeechRecognitionオブジェクトを作成
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // 設定
        this.recognition.continuous = true; // 連続認識
        this.recognition.interimResults = true; // 中間結果を取得
        this.recognition.maxAlternatives = 3; // 代替候補数を増やして精度向上
        this.recognition.lang = this.languageSelect.value; // 言語設定

        this.setupRecognitionEvents();
    }

    setupRecognitionEvents() {
        if (!this.recognition) return;

        // 認識開始時
        this.recognition.onstart = () => {
            console.log('音声認識が開始されました');
            this.isListening = true;
            // セッション開始時は常にインデックスをリセット
            this.lastResultIndex = 0;
            this.updateStatus('認識中');
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
        };

        // 認識結果取得時
        this.recognition.onresult = (event) => {
            console.log('認識結果を受信:', event.results.length, 'lastResultIndex:', this.lastResultIndex);
            
            let interim = '';
            let final = '';

            // 結果を処理
            for (let i = this.lastResultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                let bestIndex = 0;
                for (let j = 1; j < result.length; j++) {
                    if (result[j].confidence > result[bestIndex].confidence) {
                        bestIndex = j;
                    }
                }
                const transcript = result[bestIndex].transcript;
                const confidence = result[bestIndex].confidence;

                console.log(`Result ${i}: "${transcript}" (isFinal: ${event.results[i].isFinal})`);

                if (event.results[i].isFinal) {
                    final += transcript;
                    // 信頼度を表示
                    if (confidence) {
                        this.updateConfidence(Math.round(confidence * 100));
                    }
                } else {
                    interim += transcript;
                }
            }

            // 確定した結果を追加
            if (final) {
                console.log('確定テキストを追加:', final);
                this.finalTranscript += final + ' ';
                // 処理済みのインデックスを更新
                for (let i = this.lastResultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        this.lastResultIndex = i + 1;
                    }
                }
            }

            // 現在の中間結果を保存
            this.interimTranscript = interim;

            // テキストエリアを更新（確定結果 + 中間結果）
            this.updateOutputText();
        };

        // エラー時
        this.recognition.onerror = (event) => {
            console.error('音声認識エラー:', event.error);
            let errorMessage = '音声認識でエラーが発生しました: ';
            
            switch (event.error) {
                case 'no-speech':
                    errorMessage += '音声が検出されませんでした';
                    break;
                case 'audio-capture':
                    errorMessage += 'マイクにアクセスできません';
                    break;
                case 'not-allowed':
                    errorMessage += 'マイクの使用が許可されていません';
                    break;
                case 'network':
                    errorMessage += 'ネットワークエラーが発生しました';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            this.showError(errorMessage);
            this.stopRecognition();
        };

        // 認識終了時
        this.recognition.onend = () => {
            console.log('音声認識が終了しました - isListening:', this.isListening);

            // 表示済みの中間結果を確定テキストに保存してからクリア
            if (this.interimTranscript) {
                this.finalTranscript += this.interimTranscript;
                this.interimTranscript = '';
                this.updateOutputText();
            }
            
            // ユーザーが停止を押していない場合は自動的に再開
            if (this.isListening) {
                console.log('音声認識を自動再開します');
                setTimeout(() => {
                    if (this.isListening) {
                        try {
                            this.recognition.start();
                        } catch (error) {
                            console.error('音声認識再開エラー:', error);
                        }
                    }
                }, 100);
            } else {
                // 停止状態の場合のUI更新
                this.updateStatus('準備完了');
                this.startBtn.disabled = false;
                this.stopBtn.disabled = true;
            }
        };
    }

    setupEventListeners() {
        // 開始ボタン
        this.startBtn.addEventListener('click', () => {
            this.startRecognition();
        });

        // 停止ボタン
        this.stopBtn.addEventListener('click', () => {
            this.stopRecognition();
        });

        // クリアボタン
        this.clearBtn.addEventListener('click', () => {
            this.clearText();
        });

        // 言語選択
        this.languageSelect.addEventListener('change', () => {
            if (this.recognition) {
                this.recognition.lang = this.languageSelect.value;
            }
            console.log('言語を変更しました:', this.languageSelect.value);
            
            // 英語モードの場合、単語クリック機能を有効化
            this.setupWordClickFeature();
        });

        // キーボードショートカット
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'Enter':
                        event.preventDefault();
                        if (!this.isListening) {
                            this.startRecognition();
                        } else {
                            this.stopRecognition();
                        }
                        break;
                    case 'Delete':
                    case 'Backspace':
                        if (event.shiftKey) {
                            event.preventDefault();
                            this.clearText();
                        }
                        break;
                }
            }
        });

        // マイクアクセス許可をリクエスト
        this.requestMicrophonePermission();
        
        // 初期状態での単語クリック機能をセットアップ
        this.setupWordClickFeature();
    }

    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('マイクアクセス許可を取得しました');
            stream.getTracks().forEach(track => track.stop()); // ストリームを停止
        } catch (error) {
            console.error('マイクアクセス許可エラー:', error);
            this.showError('マイクへのアクセス許可が必要です。ブラウザの設定を確認してください。');
        }
    }

    startRecognition() {
        if (!this.recognition) {
            this.showError('音声認識が初期化されていません');
            return;
        }

        if (this.isListening) {
            console.log('既に音声認識中です');
            return;
        }

        console.log('startRecognition呼び出し');
        
        try {
            // 手動開始の場合はインデックスをリセット
            this.lastResultIndex = 0;
            this.recognition.start();
            console.log('音声認識を開始します');
        } catch (error) {
            console.error('音声認識開始エラー:', error);
            this.showError('音声認識を開始できませんでした');
        }
    }

    stopRecognition() {
        console.log('stopRecognition呼び出し - isListening:', this.isListening);
        
        if (!this.recognition) {
            return;
        }

        // フラグを先に設定して自動再開を防ぐ
        this.isListening = false;
        
        try {
            this.recognition.stop();
            console.log('音声認識を停止します');
        } catch (error) {
            console.error('音声認識停止エラー:', error);
        }
        
        // UI を即座に更新
        this.updateStatus('準備完了');
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
    }

    clearText() {
        this.finalTranscript = '';
        this.interimTranscript = '';
        this.lastResultIndex = 0;
        this.updateOutputText();
        this.updateConfidence(null);
        console.log('テキストをクリアしました');
    }

    updateStatus(message, className = '') {
        this.statusElement.textContent = message;
        this.statusElement.className = `status ${className}`;
    }

    updateConfidence(confidence) {
        if (confidence !== null && confidence !== undefined) {
            this.confidenceElement.textContent = `信頼度: ${confidence}%`;
        } else {
            this.confidenceElement.textContent = '';
        }
    }

    updateOutputText() {
        const fullText = this.finalTranscript + this.interimTranscript;
        console.log('updateOutputText呼び出し:');
        console.log('  finalTranscript:', JSON.stringify(this.finalTranscript));
        console.log('  interimTranscript:', JSON.stringify(this.interimTranscript));
        console.log('  fullText:', JSON.stringify(fullText));
        
        // 英語モードの場合、単語をクリック可能にする
        if (this.isEnglishMode()) {
            this.renderClickableText(fullText);
        } else {
            this.outputTextElement.textContent = fullText;
        }
    }

    isEnglishMode() {
        return this.languageSelect.value.startsWith('en-');
    }

    renderClickableText(text) {
        // テキストを単語に分割
        const words = text.split(/(\s+)/);
        this.outputTextElement.innerHTML = '';
        
        words.forEach(word => {
            if (word.trim() && /[a-zA-Z]/.test(word)) {
                // 英単語の場合、クリック可能にする
                const span = document.createElement('span');
                span.textContent = word;
                span.className = 'clickable-word';
                span.addEventListener('click', () => this.copyToClipboard(word.trim()));
                this.outputTextElement.appendChild(span);
            } else {
                // 空白や記号の場合、そのまま表示
                const textNode = document.createTextNode(word);
                this.outputTextElement.appendChild(textNode);
            }
        });
    }

    async copyToClipboard(word) {
        try {
            await navigator.clipboard.writeText(word);
            console.log(`単語 "${word}" をクリップボードにコピーしました`);
            
            // 一時的にフィードバックを表示
            this.showWordCopyFeedback(word);
        } catch (error) {
            console.error('クリップボードへのコピーに失敗:', error);
            
            // フォールバック: 古いブラウザ対応
            this.fallbackCopyToClipboard(word);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            console.log(`単語 "${text}" をクリップボードにコピーしました（フォールバック）`);
            this.showWordCopyFeedback(text);
        } catch (error) {
            console.error('フォールバックコピーも失敗:', error);
        }
        
        document.body.removeChild(textArea);
    }

    showWordCopyFeedback(word) {
        // ステータスに一時的にフィードバックを表示
        const originalStatus = this.statusElement.textContent;
        this.updateStatus(`"${word}" をコピーしました`);
        
        setTimeout(() => {
            if (!this.isListening) {
                this.updateStatus('準備完了');
            } else {
                this.updateStatus('認識中');
            }
        }, 1500);
    }

    setupWordClickFeature() {
        // 現在のテキストを再レンダリング
        this.updateOutputText();
    }

    showError(message) {
        this.updateStatus(message, 'error');
        console.error(message);
        
        // 3秒後にステータスをリセット
        setTimeout(() => {
            if (!this.isListening) {
                this.updateStatus('準備完了');
            }
        }, 3000);
    }
}

// DOM読み込み完了後にアプリを初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('音声認識アプリを初期化中...');
    
    // ブラウザ対応チェック
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        document.getElementById('status').textContent = 'お使いのブラウザはマイクアクセスをサポートしていません';
        return;
    }

    const app = new SpeechRecognitionApp();
    
    // グローバルに公開（デバッグ用）
    window.speechApp = app;
    
    console.log('音声認識アプリが正常に初期化されました');
    
    // 使用方法の説明を表示
    console.log('使用方法:');
    console.log('- Ctrl/Cmd + Enter: 認識開始/停止');
    console.log('- Ctrl/Cmd + Shift + Delete: テキストクリア');
});

// エラーハンドリング
window.addEventListener('error', (event) => {
    console.error('グローバルエラー:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未処理のPromise拒否:', event.reason);
});

// パフォーマンス監視
window.addEventListener('load', () => {
    if (window.performance && window.performance.now) {
        const loadTime = window.performance.now();
        console.log(`ページ読み込み時間: ${Math.round(loadTime)}ms`);
    }
});
