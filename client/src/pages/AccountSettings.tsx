import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  User,
  CreditCard,
  Users,
  Settings,
  Shield,
  Key,
  Monitor,
  Gift,
  UserCheck,
  Terminal,
  Link,
  Globe,
  Palette,
  Plus,
  Edit,
  X,
  Server,
} from 'lucide-react';
import { Link as RouterLink } from 'wouter';

export function AccountSettings() {
  const [activeSection, setActiveSection] = useState<string>('profile');

  const user = {
    name: 'Rudolf du Toit',
    username: 'rudolfdutoit',
    email: 'rudolf.dutoit@stargate.ai',
    initials: 'RD',
    plan: 'Quantum Core',
    planPrice: '$99/month',
    joinDate: 'March 2024',
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
    { id: 'roles', label: 'Roles', icon: UserCheck },
    { id: 'ssh-keys', label: 'SSH Keys', icon: Key },
    { id: 'account-secrets', label: 'Account Secrets', icon: Shield },
    { id: 'connected-services', label: 'Connected Services', icon: Link },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'themes', label: 'Themes', icon: Palette },
  ];

  const renderProfileSection = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src="/api/placeholder/96/96" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-2xl font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-semibold text-white">{user.name}</h3>
          <p className="text-gray-400">@{user.username}</p>
          <p className="text-gray-500 text-sm">Joined {user.joinDate}</p>
          <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-blue-600">{user.plan}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-gray-300">Display Name</Label>
          <Input defaultValue={user.name} className="bg-gray-800 border-gray-600 text-white mt-2" />
        </div>
        <div>
          <Label className="text-gray-300">Username</Label>
          <Input
            defaultValue={user.username}
            className="bg-gray-800 border-gray-600 text-white mt-2"
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-gray-300">Bio</Label>
          <textarea
            className="w-full mt-2 bg-gray-800 border-gray-600 text-white rounded-md p-3 resize-none"
            rows={4}
            placeholder="Tell us about yourself..."
          />
        </div>
        <div>
          <Label className="text-gray-300">Location</Label>
          <Input
            placeholder="City, Country"
            className="bg-gray-800 border-gray-600 text-white mt-2"
          />
        </div>
        <div>
          <Label className="text-gray-300">Website</Label>
          <Input
            placeholder="https://yourwebsite.com"
            className="bg-gray-800 border-gray-600 text-white mt-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-8">
      {/* Account Overview */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Your account overview</h3>
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-xl font-semibold text-white">Quantum Core</h4>
              <p className="text-gray-300">
                Premium development platform with quantum computing access
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">$99.00</div>
              <div className="text-gray-400 text-sm">per month</div>
              <Badge className="bg-green-600 mt-2">Active</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-white">Unlimited</div>
              <div className="text-gray-400 text-sm">Private Projects</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-white">100GB</div>
              <div className="text-gray-400 text-sm">Storage</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-white">Quantum</div>
              <div className="text-gray-400 text-sm">Computing</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-white">24/7</div>
              <div className="text-gray-400 text-sm">Priority Support</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-600">
            <div>
              <p className="text-gray-300 text-sm">Next billing date: Jan 12, 2025</p>
              <p className="text-gray-400 text-xs">Your subscription will automatically renew</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                Change Plan
              </Button>
              <Button variant="outline" size="sm">
                Cancel Subscription
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h4 className="text-white font-semibold mb-4">Payment method</h4>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">•••• •••• •••• 4242</div>
                <div className="text-gray-400 text-sm">Visa ending in 4242 • Expires 12/26</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>
        </div>
        <Button variant="outline" className="mt-3" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add payment method
        </Button>
      </div>

      {/* Billing Address */}
      <div>
        <h4 className="text-white font-semibold mb-4">Billing address</h4>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white font-medium">Rudolf du Toit</div>
              <div className="text-gray-400">123 Innovation Drive</div>
              <div className="text-gray-400">Cape Town, Western Cape 8001</div>
              <div className="text-gray-400">South Africa</div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                Edit Address
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">Billing history</h4>
          <Button variant="outline" size="sm">
            Download all
          </Button>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-700/50 text-gray-300 text-sm font-medium">
            <div>Date</div>
            <div>Description</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
          <div className="divide-y divide-gray-700">
            <div className="grid grid-cols-4 gap-4 p-4 text-sm">
              <div className="text-white">Dec 12, 2024</div>
              <div className="text-gray-300">Quantum Core - Monthly Subscription</div>
              <div className="text-white">$99.00</div>
              <div>
                <Badge className="bg-green-600 text-xs">Paid</Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4 text-sm">
              <div className="text-white">Nov 12, 2024</div>
              <div className="text-gray-300">Quantum Core - Monthly Subscription</div>
              <div className="text-white">$99.00</div>
              <div>
                <Badge className="bg-green-600 text-xs">Paid</Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4 text-sm">
              <div className="text-white">Oct 12, 2024</div>
              <div className="text-gray-300">Quantum Core - Monthly Subscription</div>
              <div className="text-white">$99.00</div>
              <div>
                <Badge className="bg-green-600 text-xs">Paid</Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4 text-sm">
              <div className="text-white">Sep 12, 2024</div>
              <div className="text-gray-300">Quantum Core - Setup Fee</div>
              <div className="text-white">$0.00</div>
              <div>
                <Badge className="bg-blue-600 text-xs">Waived</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Preferences */}
      <div>
        <h4 className="text-white font-semibold mb-4">Billing preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Email receipts</Label>
              <p className="text-xs text-gray-500">
                Get email confirmations for payments and invoices
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Usage alerts</Label>
              <p className="text-xs text-gray-500">Get notified when approaching plan limits</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Auto-renewal notifications</Label>
              <p className="text-xs text-gray-500">Remind me 7 days before subscription renewal</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Usage & Credits */}
      <div>
        <h4 className="text-white font-semibold mb-4">Usage this month</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">CPU Hours</span>
              <span className="text-white text-sm">847 / ∞</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">Storage</span>
              <span className="text-white text-sm">23.4GB / 100GB</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">AI Credits</span>
              <span className="text-white text-sm">1,247 / ∞</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-8">
      {/* Editor Preferences */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Editor Preferences</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300">Font Size</Label>
              <select className="w-full mt-2 bg-gray-800 border border-gray-600 text-white rounded-md p-2">
                <option>12px</option>
                <option>14px</option>
                <option selected>16px</option>
                <option>18px</option>
                <option>20px</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Font Family</Label>
              <select className="w-full mt-2 bg-gray-800 border border-gray-600 text-white rounded-md p-2">
                <option selected>Fira Code</option>
                <option>Monaco</option>
                <option>Consolas</option>
                <option>Source Code Pro</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Auto-save</Label>
                <p className="text-xs text-gray-500">Automatically save files as you type</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Word wrap</Label>
                <p className="text-xs text-gray-500">Wrap long lines in the editor</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Line numbers</Label>
                <p className="text-xs text-gray-500">Show line numbers in editor</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Preferences */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Terminal Preferences</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300">Default Shell</Label>
              <select className="w-full mt-2 bg-gray-800 border border-gray-600 text-white rounded-md p-2">
                <option selected>bash</option>
                <option>zsh</option>
                <option>fish</option>
                <option>sh</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-300">Cursor Style</Label>
              <select className="w-full mt-2 bg-gray-800 border border-gray-600 text-white rounded-md p-2">
                <option selected>Block</option>
                <option>Line</option>
                <option>Underline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Collaboration</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Show collaborator cursors</Label>
              <p className="text-xs text-gray-500">Display cursors of other users in real-time</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Auto-follow mode</Label>
              <p className="text-xs text-gray-500">Follow the cursor of the project owner</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRolesSection = () => (
    <div className="space-y-8">
      <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-white font-medium">Team Feature</h4>
            <p className="text-orange-300 text-sm">
              Roles are available for team accounts. Upgrade to manage user permissions.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Current Role</h3>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-white">Account Owner</h4>
              <p className="text-gray-300">Full access to all account features and settings</p>
              <Badge className="bg-purple-600 mt-2">Admin</Badge>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Available Roles</h3>
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Owner</h4>
                <p className="text-gray-400 text-sm">Full administrative access</p>
              </div>
              <Badge className="bg-red-600">Full Access</Badge>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Admin</h4>
                <p className="text-gray-400 text-sm">Manage projects and users</p>
              </div>
              <Badge className="bg-orange-600">High Access</Badge>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Developer</h4>
                <p className="text-gray-400 text-sm">Create and edit projects</p>
              </div>
              <Badge className="bg-blue-600">Standard Access</Badge>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Viewer</h4>
                <p className="text-gray-400 text-sm">Read-only access to projects</p>
              </div>
              <Badge className="bg-gray-600">Limited Access</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSSHKeysSection = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">SSH Keys</h3>
        <p className="text-gray-400 mb-6">
          Add SSH keys to securely access your Stargate projects from external tools.
        </p>

        <div className="flex justify-end mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add SSH Key
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Your SSH Keys</h4>
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Key className="w-5 h-5 text-blue-400" />
                  <h5 className="text-white font-medium">MacBook Pro (Work)</h5>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </div>
                <p className="text-gray-400 text-sm font-mono">
                  ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7...
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Added on Dec 15, 2024 • Last used 2 hours ago
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Key className="w-5 h-5 text-gray-400" />
                  <h5 className="text-white font-medium">Home Desktop</h5>
                  <Badge className="bg-gray-600 text-xs">Inactive</Badge>
                </div>
                <p className="text-gray-400 text-sm font-mono">
                  ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQD9...
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Added on Nov 28, 2024 • Last used 5 days ago
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">How to generate an SSH key</h4>
        <p className="text-blue-300 text-sm mb-3">
          Generate a new SSH key pair on your local machine using:
        </p>
        <code className="bg-gray-800 px-3 py-2 rounded text-blue-300 text-sm block">
          ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
        </code>
      </div>
    </div>
  );

  const renderAccountSecretsSection = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Account Secrets</h3>
        <p className="text-gray-400 mb-6">
          Store environment variables and API keys securely across all your projects.
        </p>

        <div className="flex justify-end mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Secret
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Environment Variables</h4>
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-700/50 text-gray-300 text-sm font-medium">
            <div>Name</div>
            <div>Value</div>
            <div>Actions</div>
          </div>
          <div className="divide-y divide-gray-700">
            <div className="grid grid-cols-3 gap-4 p-4 text-sm">
              <div className="text-white font-mono">OPENAI_API_KEY</div>
              <div className="text-gray-400 font-mono">sk-••••••••••••••••••••••••••••••••</div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 text-sm">
              <div className="text-white font-mono">STRIPE_SECRET_KEY</div>
              <div className="text-gray-400 font-mono">sk_test_••••••••••••••••••••••••••••</div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 text-sm">
              <div className="text-white font-mono">DATABASE_URL</div>
              <div className="text-gray-400 font-mono">postgresql://••••••••••••••••••••••</div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Security Notice</h4>
        <p className="text-yellow-300 text-sm">
          These secrets are encrypted and only accessible to your projects. Never share secret
          values in code or logs.
        </p>
      </div>
    </div>
  );

  const renderConnectedServicesSection = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Connected Services</h3>
        <p className="text-gray-400 mb-6">
          Connect external services to enhance your development workflow.
        </p>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Version Control</h4>
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-medium">GitHub</h5>
                  <p className="text-gray-400 text-sm">Import repositories and sync code changes</p>
                  <Badge className="bg-green-600 text-xs mt-1">Connected</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-medium">GitLab</h5>
                  <p className="text-gray-400 text-sm">Enterprise git repository management</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">AI Services</h4>
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-medium">OpenAI</h5>
                  <p className="text-gray-400 text-sm">
                    GPT models for code assistance and generation
                  </p>
                  <Badge className="bg-green-600 text-xs mt-1">Connected</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-medium">Anthropic</h5>
                  <p className="text-gray-400 text-sm">Claude models for advanced AI assistance</p>
                  <Badge className="bg-green-600 text-xs mt-1">Connected</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Deployment & Hosting</h4>
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-medium">Vercel</h5>
                  <p className="text-gray-400 text-sm">Deploy frontend applications instantly</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-medium">AWS</h5>
                  <p className="text-gray-400 text-sm">Deploy to Amazon Web Services</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Connect
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDomainsSection = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Custom Domains</h3>
        <p className="text-gray-400 mb-6">
          Connect custom domains to your Stargate projects for professional deployment.
        </p>

        <div className="flex justify-end mb-6">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Your Domains</h4>
        <div className="space-y-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Globe className="w-5 h-5 text-green-400" />
                  <h5 className="text-white font-medium">stargate-demo.com</h5>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </div>
                <p className="text-gray-400 text-sm">Connected to: quantum-calculator</p>
                <p className="text-gray-500 text-xs mt-1">
                  SSL Certificate: Valid until Jan 15, 2026
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Configure
                </Button>
                <Button variant="destructive" size="sm">
                  Remove
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Globe className="w-5 h-5 text-yellow-400" />
                  <h5 className="text-white font-medium">api.myproject.dev</h5>
                  <Badge className="bg-yellow-600 text-xs">Pending</Badge>
                </div>
                <p className="text-gray-400 text-sm">Connecting to: ai-api-backend</p>
                <p className="text-gray-500 text-xs mt-1">DNS verification in progress...</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Configure
                </Button>
                <Button variant="destructive" size="sm">
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Domain Setup Instructions</h4>
        <div className="space-y-2 text-blue-300 text-sm">
          <p>
            1. Add a CNAME record pointing to:{' '}
            <code className="bg-gray-800 px-2 py-1 rounded">projects.stargate.ai</code>
          </p>
          <p>2. Wait for DNS propagation (usually 5-30 minutes)</p>
          <p>3. SSL certificates are automatically generated and renewed</p>
        </div>
      </div>
    </div>
  );

  const renderThemesSection = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Interface Themes</h3>
        <p className="text-gray-400 mb-6">
          Customize your Stargate interface with different color schemes and layouts.
        </p>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Official Themes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800 border-2 border-blue-600 rounded-lg p-4 cursor-pointer">
            <div className="h-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded mb-3 flex items-center justify-center">
              <span className="text-white text-xs">Dark</span>
            </div>
            <h5 className="text-white font-medium">Stargate Dark</h5>
            <p className="text-gray-400 text-xs">Default dark theme</p>
            <Badge className="bg-blue-600 text-xs mt-2">Active</Badge>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-500">
            <div className="h-20 bg-gradient-to-br from-gray-100 to-white rounded mb-3 flex items-center justify-center">
              <span className="text-gray-800 text-xs">Light</span>
            </div>
            <h5 className="text-white font-medium">Stargate Light</h5>
            <p className="text-gray-400 text-xs">Clean light theme</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-500">
            <div className="h-20 bg-gradient-to-br from-purple-900 to-indigo-900 rounded mb-3 flex items-center justify-center">
              <span className="text-purple-200 text-xs">Quantum</span>
            </div>
            <h5 className="text-white font-medium">Quantum Purple</h5>
            <p className="text-gray-400 text-xs">Premium purple theme</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Custom Themes</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-500">
            <div className="h-20 bg-gradient-to-br from-emerald-900 to-teal-900 rounded mb-3 flex items-center justify-center">
              <span className="text-emerald-200 text-xs">Matrix</span>
            </div>
            <h5 className="text-white font-medium">Matrix Green</h5>
            <p className="text-gray-400 text-xs">Retro hacker theme</p>
          </div>

          <div className="bg-gray-800 border border-dashed border-gray-600 rounded-lg p-4 cursor-pointer hover:border-gray-500 flex flex-col items-center justify-center text-center">
            <Plus className="w-8 h-8 text-gray-500 mb-2" />
            <h5 className="text-gray-400 font-medium">Create Custom</h5>
            <p className="text-gray-500 text-xs">Design your own theme</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-4">Theme Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Auto dark mode</Label>
              <p className="text-xs text-gray-500">Switch to dark theme automatically at sunset</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">High contrast mode</Label>
              <p className="text-xs text-gray-500">Increase contrast for better accessibility</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Reduced animations</Label>
              <p className="text-xs text-gray-500">Minimize interface animations</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );

  const renderReferralsSection = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Gift className="w-8 h-8 text-purple-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">Referral Program</h3>
            <p className="text-gray-300">Earn 1 month free for each successful referral!</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <code className="bg-gray-800 px-4 py-2 rounded text-purple-300 font-mono flex-1">
            https://stargate.ai/ref/rudolfdutoit
          </code>
          <Button size="sm">Copy Link</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-white mb-2">12</div>
          <div className="text-gray-400">Total Referrals</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">8</div>
          <div className="text-gray-400">Successful</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">$792</div>
          <div className="text-gray-400">Credits Earned</div>
        </div>
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div className="space-y-8">
      {/* Account Information */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Account Information</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300">Email Address</Label>
              <Input
                value={user.email}
                readOnly
                className="bg-gray-800 border-gray-600 text-white mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Your primary email address</p>
            </div>
            <div>
              <Label className="text-gray-300">Account ID</Label>
              <Input
                value="stg_usr_8x7k9m2n3p4q5r6s"
                readOnly
                className="bg-gray-800 border-gray-600 text-white mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Your unique account identifier</p>
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Account Status</Label>
            <div className="flex items-center space-x-3 mt-2">
              <Badge className="bg-green-600">Active</Badge>
              <span className="text-gray-400 text-sm">Your account is in good standing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Security</h3>
        <div className="space-y-6">
          <div>
            <Label className="text-gray-300">Password</Label>
            <div className="flex items-center space-x-3 mt-2">
              <Input
                type="password"
                value="••••••••••••"
                readOnly
                className="bg-gray-800 border-gray-600 text-white flex-1"
              />
              <Button variant="outline">Change Password</Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Last changed 3 months ago</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Two-Factor Authentication</Label>
                <p className="text-xs text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Login Notifications</Label>
                <p className="text-xs text-gray-500">
                  Get notified when someone logs into your account
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Privacy</h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Profile Visibility</Label>
                <p className="text-xs text-gray-500">
                  Make your profile visible to other Stargate users
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Activity Status</Label>
                <p className="text-xs text-gray-500">Show when you're online and active</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Analytics & Tracking</Label>
                <p className="text-xs text-gray-500">
                  Help us improve Stargate with usage analytics
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-6">Account Actions</h3>
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Export Account Data</h4>
                <p className="text-gray-400 text-sm">Download all your account data and projects</p>
              </div>
              <Button variant="outline">Export Data</Button>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Delete Account</h4>
                <p className="text-gray-400 text-sm">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'account':
        return renderAccountSection();
      case 'billing':
        return renderBillingSection();
      case 'referrals':
        return renderReferralsSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'roles':
        return renderRolesSection();
      case 'ssh-keys':
        return renderSSHKeysSection();
      case 'account-secrets':
        return renderAccountSecretsSection();
      case 'connected-services':
        return renderConnectedServicesSection();
      case 'domains':
        return renderDomainsSection();
      case 'themes':
        return renderThemesSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center space-x-4">
          <RouterLink href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to IDE
            </Button>
          </RouterLink>
          <div>
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-gray-400">Manage your Stargate account and preferences</p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/30 border-r border-gray-700 min-h-screen p-6">
          <nav className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
}
