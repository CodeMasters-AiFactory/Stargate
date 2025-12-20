/**
 * Merlin Approval Dialog
 * Dialog for Merlin to review and approve/reject agent upgrade proposals
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AgentAvatar } from './AgentAvatar';
import { getAgentConfig } from './types';
import type { UpgradeProposal } from './types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUp,
  Clock,
  FileText,
  Shield,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MerlinApprovalDialogProps {
  proposals: UpgradeProposal[];
  isOpen: boolean;
  onClose: () => void;
  onApprove: (proposalId: string, notes?: string) => Promise<void>;
  onReject: (proposalId: string, notes?: string) => Promise<void>;
}

export function MerlinApprovalDialog({
  proposals,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: MerlinApprovalDialogProps) {
  const [selectedProposal, setSelectedProposal] = useState<UpgradeProposal | null>(
    proposals[0] || null
  );
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!selectedProposal) return;
    setIsProcessing(true);
    try {
      await onApprove(selectedProposal.id, notes);
      setNotes('');
      // Move to next proposal or close
      const remaining = proposals.filter(p => p.id !== selectedProposal.id);
      if (remaining.length > 0) {
        setSelectedProposal(remaining[0]);
      } else {
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProposal) return;
    setIsProcessing(true);
    try {
      await onReject(selectedProposal.id, notes);
      setNotes('');
      // Move to next proposal or close
      const remaining = proposals.filter(p => p.id !== selectedProposal.id);
      if (remaining.length > 0) {
        setSelectedProposal(remaining[0]);
      } else {
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getRiskBadge = (risk: UpgradeProposal['riskAssessment']) => {
    const config = {
      low: { color: 'bg-green-500/20 text-green-400', icon: Shield },
      medium: { color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle },
      high: { color: 'bg-orange-500/20 text-orange-400', icon: AlertTriangle },
      critical: { color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
    };
    const { color, icon: Icon } = config[risk];
    return (
      <Badge className={cn(color, 'gap-1')}>
        <Icon className="w-3 h-3" />
        {risk.toUpperCase()} Risk
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">🧙</span>
            <span>MERLIN - Upgrade Review</span>
            <Badge variant="outline" className="ml-auto">
              {proposals.length} pending
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review and approve or reject agent upgrade proposals
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* Proposal List */}
          <div className="col-span-1 border-r border-white/10 pr-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Pending Proposals
            </h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {proposals.map((proposal) => {
                  const _config = getAgentConfig(proposal.agentName);
                  const isSelected = selectedProposal?.id === proposal.id;
                  
                  return (
                    <motion.div
                      key={proposal.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-3 rounded-lg cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-purple-500/20 border border-purple-500/50'
                          : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                      )}
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      <div className="flex items-center gap-2">
                        <AgentAvatar 
                          agentName={proposal.agentName} 
                          size="sm"
                          showStatus={false}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {proposal.agentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            v{proposal.currentVersion} → v{proposal.proposedVersion}
                          </p>
                        </div>
                        {isSelected && (
                          <ChevronRight className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Proposal Details */}
          <div className="col-span-2 pl-4">
            <AnimatePresence mode="wait">
              {selectedProposal ? (
                <motion.div
                  key={selectedProposal.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <AgentAvatar
                        agentName={selectedProposal.agentName}
                        size="lg"
                        showStatus={false}
                      />
                      <div>
                        <h3 className="font-semibold text-white">
                          {selectedProposal.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            v{selectedProposal.currentVersion} → v{selectedProposal.proposedVersion}
                          </Badge>
                          {getRiskBadge(selectedProposal.riskAssessment)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Description
                    </h4>
                    <p className="text-sm text-gray-300">
                      {selectedProposal.description}
                    </p>
                  </div>

                  {/* Reason */}
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Reason
                    </h4>
                    <p className="text-sm text-gray-300">
                      {selectedProposal.reason}
                    </p>
                  </div>

                  {/* Expected Benefits */}
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Expected Benefits
                    </h4>
                    <ul className="space-y-1">
                      {selectedProposal.expectedBenefits.map((benefit, i) => (
                        <li 
                          key={i}
                          className="text-sm text-gray-300 flex items-start gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Proposed Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    Proposed: {new Date(selectedProposal.proposedAt).toLocaleString()}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Notes (optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes for the agent..."
                      className="mt-1 bg-gray-800 border-white/10"
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Shield className="w-12 h-12 mb-2 opacity-30" />
                  <p>Select a proposal to review</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!selectedProposal || isProcessing}
          >
            <XCircle className="w-4 h-4 mr-1" />
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={!selectedProposal || isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Approve Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Notification badge for pending upgrades
 */
export function UpgradePendingBadge({ 
  count, 
  onClick 
}: { 
  count: number; 
  onClick: () => void;
}) {
  if (count === 0) return null;
  
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        'hover:bg-amber-500/30 transition-colors'
      )}
    >
      <Shield className="w-4 h-4" />
      <span className="text-sm font-medium">
        {count} Upgrade{count !== 1 && 's'} Pending
      </span>
    </motion.button>
  );
}

export default MerlinApprovalDialog;

