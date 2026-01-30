import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Send, Check } from 'lucide-react';
import apiClient from '../../services/apiClient';

interface SponsorOutreachModalProps {
    isOpen: boolean;
    onClose: () => void;
    influencerName: string;
    niche: string;
    campaignDetails: string;
    influencerEmail?: string;
}

const SponsorOutreachModal: React.FC<SponsorOutreachModalProps> = ({
    isOpen,
    onClose,
    influencerName,
    niche,
    campaignDetails,
    influencerEmail = 'creator@example.com' // Fallback for demo
}) => {
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const generateInvitation = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/campaigns/generate-invitation', {
                params: {
                    influencer_name: influencerName || "Creator",
                    niche: niche,
                    details: campaignDetails
                }
            });
            setSubject(response.data.subject);
            setBody(response.data.body);
        } catch (error) {
            console.error('Failed to generate invitation:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendInvitation = async () => {
        setSending(true);
        try {
            await apiClient.post('/campaigns/send-invitation', null, {
                params: {
                    email: influencerEmail,
                    subject: subject,
                    body: body
                }
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSubject('');
                setBody('');
            }, 2000);
        } catch (error) {
            console.error('Failed to send invitation:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-gray-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        Professional Outreach: {influencerName}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Generate a customized invitation to collaborate with this creator.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    {!subject && !loading && (
                        <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl space-y-4">
                            <p className="text-sm text-gray-400">
                                Click below to generate a professional invitation draft using AI.
                            </p>
                            <Button
                                onClick={generateInvitation}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generate with AI
                            </Button>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            <p className="text-sm text-gray-400 font-medium">Crafting the perfect invitation...</p>
                        </div>
                    )}

                    {subject && !loading && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Subject</label>
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Message Body</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={10}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-purple-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        Cancel
                    </Button>
                    {subject && (
                        <Button
                            onClick={sendInvitation}
                            disabled={sending || success}
                            className={`${success ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white min-w-[120px]`}
                        >
                            {sending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : success ? (
                                <><Check className="w-4 h-4 mr-2" /> Sent!</>
                            ) : (
                                <><Send className="w-4 h-4 mr-2" /> Send Invitation</>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SponsorOutreachModal;
