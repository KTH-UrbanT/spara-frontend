import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function DemoGeneratorAdmin() {
    const [referral, setReferral] = useState('Q-Bot');
    const [autoMessage, setAutoMessage] = useState('Hello! I want to participate in the Demo of this bot. Tell me what is your purpose and how can you help me with energy savings. Ask me a multiple choice quiz question about energy saving for me to answer.');
    const [generatedURL, setGeneratedURL] = useState('');

    const baseURL = window.location.origin; // Gets current domain

    const generateURL = () => {
        if (!referral.trim() || !autoMessage.trim()) {
            alert('Please fill in both fields');
            return;
        }

        const encodedMessage = encodeURIComponent(autoMessage);
        const url = `${baseURL}/demo?referral=${referral}&auto_message=${encodedMessage}`;
        setGeneratedURL(url);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedURL);
        alert('URL copied to clipboard!');
    };

    const downloadQR = () => {
        const canvas = document.createElement('canvas');
        const svg = document.querySelector('#qr-code-image');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();

        img.onload = () => {
            canvas.width = canvas.height = 300;
            canvas.getContext('2d').drawImage(img, 0, 0, 300, 300);

            const link = document.createElement('a');
            link.download = `demo-qr-${referral}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };

        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
    };

    return (
        <div className="h-full flex justify-center items-center">
            <div className="card w-full max-w-xl h-4/5 bg-base-100 shadow-xl overflow-y-auto">
                <div className="card-body p-6">
                    <h1 className="card-title text-xl font-bold justify-center mb-4">
                        Demo URL Generator
                    </h1>

                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Referral Source</span>
                            </label>
                            <input
                                type="text"
                                value={referral}
                                onChange={(e) => setReferral(e.target.value)}
                                placeholder="e.g., Organization Name"
                                className="input input-bordered w-full"
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Auto Message</span>
                            </label>
                            <textarea
                                value={autoMessage}
                                onChange={(e) => setAutoMessage(e.target.value)}
                                rows={4}
                                placeholder="Enter the message that will be automatically sent..."
                                className="textarea textarea-bordered w-full"
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/70">
                                    Character count: {autoMessage.length}
                                </span>
                            </label>
                        </div>

                        <div className="form-control mt-6">
                            <button
                                onClick={generateURL}
                                className="btn btn-primary w-full"
                            >
                                Generate Demo URL
                            </button>
                        </div>
                    </div>

                    {generatedURL && (
                        <>
                            <div className="divider mt-6">Generated URL</div>

                            <div className="card bg-success/10 border border-success/20">
                                <div className="card-body p-4">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-base-200 p-3 rounded border text-sm break-all font-mono">
                                            {generatedURL}
                                        </div>

                                        <div className="card-actions justify-end mt-3">
                                            <button
                                                onClick={copyToClipboard}
                                                className="btn btn-success btn-sm"
                                            >
                                                Copy URL
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="divider mt-6">QR Code</div>

                            <div className="card bg-primary/10 border border-primary/20">
                                <div className="card-body p-4">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-white p-4 rounded shadow-md">
                                            <QRCodeSVG
                                                id="qr-code-image"
                                                value={generatedURL}
                                                size={200}
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                                level="M"
                                                marginSize={2}
                                            />
                                        </div>

                                        <div className="card-actions justify-end mt-3">
                                            <button
                                                onClick={downloadQR}
                                                className="btn btn-primary btn-sm mt-4"
                                            >
                                                Download QR Code
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="divider mt-6">Instructions</div>

                    <div className="alert alert-info">
                        <div className="text-sm">
                            <div className="font-medium mb-1">Usage Instructions:</div>
                            <ol className="list-decimal list-inside space-y-1 text-xs">
                                <li>Enter the referral source (organization name)</li>
                                <li>Write the auto message that users will see</li>
                                <li>Click "Generate Demo URL" to create the encoded URL</li>
                                <li>Copy the URL and use it for your demo</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};