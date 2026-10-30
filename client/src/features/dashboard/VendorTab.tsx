import React, { useState } from 'react';
import { EventData, VendorChecklistItem, VendorStatus } from '@jashn/shared';
import { formatINR } from '../../lib/utils';
import { Copy, Check, ArrowRight } from 'lucide-react';

interface VendorTabProps {
  event: EventData;
  onUpdateVendor: (vendorId: string, payload: Partial<VendorChecklistItem>) => Promise<void>;
}

const PIPELINE_COLUMNS: Array<{ status: VendorStatus; label: string }> = [
  { status: 'to_contact', label: 'TO CONTACT' },
  { status: 'contacted', label: 'CONTACTED' },
  { status: 'quoted', label: 'QUOTED' },
  { status: 'booked', label: 'BOOKED' }
];

export const VendorTab: React.FC<VendorTabProps> = ({ event, onUpdateVendor }) => {
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  const [vName, setVName] = useState('');
  const [vContact, setVContact] = useState('');
  const [vQuote, setVQuote] = useState<number | undefined>(undefined);
  const [vNotes, setVNotes] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(text);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  const handleStartEdit = (vendor: VendorChecklistItem) => {
    setEditingVendorId(vendor.id);
    setVName(vendor.vendorName || '');
    setVContact(vendor.contact || '');
    setVQuote(vendor.quote);
    setVNotes(vendor.notes || '');
  };

  const handleSaveVendor = async (vendorId: string) => {
    await onUpdateVendor(vendorId, {
      vendorName: vName,
      contact: vContact,
      quote: vQuote,
      notes: vNotes
    });
    setEditingVendorId(null);
  };

  const handleMoveStatus = async (vendor: VendorChecklistItem, nextStatus: VendorStatus) => {
    await onUpdateVendor(vendor.id, { status: nextStatus });
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-powder/15">
        <h2 className="font-slab text-2xl uppercase tracking-tight text-powder">
          VENDOR PIPELINE
        </h2>
        <div className="text-xs font-semibold text-powder/60 mt-0.5">
          Tap questions to copy directly for WhatsApp or email enquiries.
        </div>
      </div>

      {/* 4-Column Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PIPELINE_COLUMNS.map(col => {
          const vendorsInCol = event.vendorChecklist.filter(v => v.status === col.status);

          return (
            <div key={col.status} className="flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-powder/20">
                <span className="font-slab text-sm uppercase tracking-wider text-powder">
                  {col.label}
                </span>
                <span className="text-[11px] font-bold text-cyan">
                  {vendorsInCol.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {vendorsInCol.map(vendor => {
                  const isEditing = editingVendorId === vendor.id;

                  return (
                    <div
                      key={vendor.id}
                      className="slab-card p-4 rounded-xl space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-slab text-base uppercase tracking-tight">
                            {vendor.category}
                          </div>
                          {vendor.vendorName && (
                            <div className="text-xs font-bold text-cyan invert-child mt-0.5">
                              {vendor.vendorName}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-powder/20 invert-child">
                          {vendor.status}
                        </span>
                      </div>

                      <div className="text-[11px] opacity-75 invert-child leading-relaxed">
                        {vendor.why}
                      </div>

                      {/* Must-Ask Questions */}
                      <div className="pt-2 border-t border-powder/15 space-y-1.5 invert-child">
                        <div className="text-[10px] font-bold uppercase opacity-50 invert-child">
                          MUST-ASK QUESTIONS (TAP TO COPY)
                        </div>

                        {vendor.mustAsk.map((q, idx) => {
                          const isCopied = copiedQuestion === q;
                          return (
                            <div
                              key={idx}
                              onClick={() => copyToClipboard(q)}
                              className="p-2 rounded-lg bg-steel/80 border border-powder/15 hover:border-cyan cursor-pointer transition text-[11px] flex items-center justify-between gap-2"
                            >
                              <span className="line-clamp-2">{q}</span>
                              <span className="shrink-0 text-powder/50">
                                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quote Preview */}
                      {vendor.quote && !isEditing && (
                        <div className="pt-2 border-t border-powder/15 flex items-center justify-between text-xs invert-child font-bold">
                          <span className="opacity-60 invert-child">Quoted:</span>
                          <span className="text-cyan invert-child font-slab text-sm">{formatINR(vendor.quote)}</span>
                        </div>
                      )}

                      {/* Edit Details Form */}
                      {isEditing ? (
                        <div className="pt-3 border-t border-powder/15 space-y-2">
                          <input
                            type="text"
                            placeholder="Vendor Name / Agency"
                            value={vName}
                            onChange={e => setVName(e.target.value)}
                            className="w-full bg-[#010B13] border border-powder/20 rounded px-2.5 py-1.5 text-xs text-powder focus:border-cyan"
                          />
                          <input
                            type="text"
                            placeholder="Contact Number"
                            value={vContact}
                            onChange={e => setVContact(e.target.value)}
                            className="w-full bg-[#010B13] border border-powder/20 rounded px-2.5 py-1.5 text-xs text-powder focus:border-cyan"
                          />
                          <input
                            type="number"
                            placeholder="Quoted Amount (₹)"
                            value={vQuote || ''}
                            onChange={e => setVQuote(Number(e.target.value))}
                            className="w-full bg-[#010B13] border border-powder/20 rounded px-2.5 py-1.5 text-xs text-powder focus:border-cyan"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingVendorId(null)}
                              className="text-xs font-bold uppercase opacity-60 hover:opacity-100 px-2 py-1 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveVendor(vendor.id)}
                              className="bg-[#010B13] text-powder hover:bg-[#111111] px-3 py-1 rounded-full text-xs font-bold uppercase cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-2 border-t border-powder/15">
                          <button
                            onClick={() => handleStartEdit(vendor)}
                            className="text-[11px] font-bold uppercase underline underline-offset-2 opacity-60 hover:opacity-100 cursor-pointer invert-child"
                          >
                            Edit
                          </button>

                          {col.status === 'to_contact' && (
                            <button
                              onClick={() => handleMoveStatus(vendor, 'contacted')}
                              className="text-[11px] font-bold uppercase text-cyan hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Contacted <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {col.status === 'contacted' && (
                            <button
                              onClick={() => handleMoveStatus(vendor, 'quoted')}
                              className="text-[11px] font-bold uppercase text-cyan hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Quoted <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {col.status === 'quoted' && (
                            <button
                              onClick={() => handleMoveStatus(vendor, 'booked')}
                              className="text-[11px] font-bold uppercase text-cyan hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Booked <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {vendorsInCol.length === 0 && (
                  <div className="p-6 rounded-xl border border-dashed border-powder/15 text-center text-powder/30 text-xs font-bold uppercase">
                    Empty Stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
