import React, { useState } from 'react';

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

    // return (
    //     <div className="max-w-4xl mx-auto p-6 bg-white">
    //         <h1 className="text-3xl font-bold text-gray-800 mb-8">Demo URL Generator</h1>

    //         <div className="bg-gray-50 p-6 rounded-lg mb-8">
    //             <div className="grid gap-6">
    //                 <div>
    //                     <label htmlFor="referral" className="block text-sm font-medium text-gray-700 mb-2">
    //                         Referral Source
    //                     </label>
    //                     <input
    //                         id="referral"
    //                         type="text"
    //                         value={referral}
    //                         onChange={(e) => setReferral(e.target.value)}
    //                         placeholder="e.g., Organization Name"
    //                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    //                     />
    //                 </div>

    //                 <div>
    //                     <label htmlFor="autoMessage" className="block text-sm font-medium text-gray-700 mb-2">
    //                         Auto Message
    //                     </label>
    //                     <textarea
    //                         id="autoMessage"
    //                         value={autoMessage}
    //                         onChange={(e) => setAutoMessage(e.target.value)}
    //                         rows={4}
    //                         placeholder="Enter the message that will be automatically sent..."
    //                         className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    //                     />
    //                     <p className="text-sm text-gray-500 mt-1">
    //                         Character count: {autoMessage.length}
    //                     </p>
    //                 </div>

    //                 <button
    //                     onClick={generateURL}
    //                     className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
    //                 >
    //                     Generate Demo URL
    //                 </button>
    //             </div>
    //         </div>

    //         {generatedURL && (
    //             <div className="bg-green-50 p-6 rounded-lg mb-8">
    //                 <h2 className="text-lg font-semibold text-gray-800 mb-3">Generated URL</h2>
    //                 <div className="bg-white p-3 rounded border break-all text-sm font-mono text-gray-700">
    //                     {generatedURL}
    //                 </div>
    //                 <div className="mt-3 flex gap-3">
    //                     <button
    //                         onClick={copyToClipboard}
    //                         className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
    //                     >
    //                         Copy URL
    //                     </button>
    //                 </div>
    //             </div>
    //         )}


    //         <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
    //             <h3 className="font-semibold text-yellow-800 mb-2">Usage Instructions</h3>
    //             <ol className="text-sm text-yellow-700 space-y-1">
    //                 <li>1. Enter the referral source (e.g., organization name)</li>
    //                 <li>2. Write the auto message that users will see</li>
    //                 <li>3. Click "Generate Demo URL" to create the encoded URL</li>
    //             </ol>
    //         </div>
    //     </div>
    // );
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
                        </>
                    )}

                    <div className="divider mt-6">Instructions</div>

                    <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
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