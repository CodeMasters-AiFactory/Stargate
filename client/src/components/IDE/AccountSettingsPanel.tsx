import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  X,
  User,
  CreditCard,
  Settings,
  Edit,
  Crown,
  Shield,
  Key,
  Monitor,
  Sun,
  Moon,
  Gift,
  UserCheck,
  Terminal,
  Link,
  Globe,
  Palette,
  Plus,
} from 'lucide-react';

interface AccountSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountSettingsPanel({ isOpen, onClose }: AccountSettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [darkMode, setDarkMode] = useState(false);

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

  const renderAccountSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src="/api/placeholder/64/64" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-lg font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
          <p className="text-gray-400">@{user.username}</p>
          <p className="text-gray-500 text-sm">Joined {user.joinDate}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-gray-300">Username</Label>
          <div className="flex mt-1">
            <Input
              value={user.username}
              className="bg-gray-800 border-gray-600 text-white flex-1"
              readOnly
            />
            <Button variant="ghost" size="sm" className="ml-2 text-gray-400">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-gray-300">Email</Label>
          <div className="flex mt-1">
            <Input
              value={user.email}
              className="bg-gray-800 border-gray-600 text-white flex-1"
              readOnly
            />
            <Button variant="ghost" size="sm" className="ml-2 text-gray-400">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-gray-300">Full Name</Label>
          <div className="flex mt-1">
            <Input
              value={user.name}
              className="bg-gray-800 border-gray-600 text-white flex-1"
              readOnly
            />
            <Button variant="ghost" size="sm" className="ml-2 text-gray-400">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-white font-medium mb-3">Account Security</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-gray-300">Two-factor authentication</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">SSH Keys</span>
            </div>
            <span className="text-gray-500 text-sm">3 keys</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h3 className="text-white font-semibold">Current Plan</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-lg font-bold">{user.plan}</p>
            <p className="text-blue-200">{user.planPrice}</p>
          </div>
          <Button variant="secondary" size="sm">
            Manage Plan
          </Button>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Payment Method</h4>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white">•••• •••• •••• 4242</p>
                <p className="text-gray-400 text-sm">Expires 12/27</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              Update
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Billing History</h4>
        <div className="space-y-2">
          {[1, 2, 3].map(item => (
            <div
              key={item}
              className="flex items-center justify-between py-2 border-b border-gray-800"
            >
              <div>
                <p className="text-white">Quantum Core Plan</p>
                <p className="text-gray-500 text-sm">Jan {item}, 2025</p>
              </div>
              <div className="text-right">
                <p className="text-white">$99.00</p>
                <p className="text-gray-500 text-sm">Paid</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTeamsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-white font-semibold mb-4">Your Teams</h3>
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold">ST</span>
                </div>
                <div>
                  <p className="text-white font-medium">Stargate Team</p>
                  <p className="text-gray-400 text-sm">Owner • 12 members</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400">
                Manage
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">Create New Team</Button>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-white font-medium mb-3">Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">Theme</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="w-4 h-4 text-gray-400" />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className="w-4 h-4 text-blue-400" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Email notifications</span>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Auto-save projects</span>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-white font-medium mb-3">Advanced</h4>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
            Export Data
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-600/20">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src="/api/placeholder/80/80" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xl font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold text-white">{user.name}</h3>
          <p className="text-gray-400">@{user.username}</p>
          <p className="text-gray-500 text-sm">Joined {user.joinDate}</p>
          <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-blue-600">{user.plan}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-gray-300">Display Name</Label>
          <Input value={user.name} className="bg-gray-800 border-gray-600 text-white mt-1" />
        </div>
        <div>
          <Label className="text-gray-300">Bio</Label>
          <textarea
            className="w-full mt-1 bg-gray-800 border-gray-600 text-white rounded-md p-3 resize-none"
            rows={3}
            placeholder="Tell us about yourself..."
          />
        </div>
        <div>
          <Label className="text-gray-300">Location</Label>
          <Input
            placeholder="City, Country"
            className="bg-gray-800 border-gray-600 text-white mt-1"
          />
        </div>
        <div>
          <Label className="text-gray-300">Website</Label>
          <Input
            placeholder="https://yourwebsite.com"
            className="bg-gray-800 border-gray-600 text-white mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderReferralsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Referral Program</h3>
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Gift className="w-6 h-6 text-purple-400" />
            <h4 className="text-white font-medium">Earn Rewards</h4>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Refer friends to Stargate and earn 1 month free for each successful referral!
          </p>
          <div className="flex items-center space-x-2">
            <code className="bg-gray-800 px-3 py-1 rounded text-purple-300 font-mono text-sm flex-1">
              https://stargate.ai/ref/rudolfdutoit
            </code>
            <Button size="sm" variant="outline">
              Copy
            </Button>
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-white font-medium mb-3">Referral Stats</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-gray-400 text-sm">Total Referrals</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">$348</div>
            <div className="text-gray-400 text-sm">Credits Earned</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Editor Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Theme</span>
            <select className="bg-gray-800 border-gray-600 text-white rounded px-3 py-1">
              <option>Dark</option>
              <option>Light</option>
              <option>Auto</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Font Size</span>
            <select className="bg-gray-800 border-gray-600 text-white rounded px-3 py-1">
              <option>12px</option>
              <option>14px</option>
              <option>16px</option>
              <option>18px</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Auto-save</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Line numbers</span>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRolesSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Account Roles</h3>
        <div className="space-y-3">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Account Owner</div>
              <div className="text-gray-400 text-sm">Full access to all features</div>
            </div>
            <Badge className="bg-green-600">Active</Badge>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Quantum Core Subscriber</div>
              <div className="text-gray-400 text-sm">Premium features enabled</div>
            </div>
            <Badge className="bg-purple-600">Premium</Badge>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSSHKeysSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">SSH Keys</h3>
        <p className="text-gray-400 text-sm mb-4">
          SSH keys allow you to establish a secure connection between your computer and Stargate.
        </p>
        <div className="space-y-3">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-medium">MacBook Pro Key</div>
              <Button variant="ghost" size="sm" className="text-red-400">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-gray-400 text-sm">
              SHA256:nThbg6kXUpJWGl7E1IGOCspRomTxdCARLviKw6E5SY8
            </div>
            <div className="text-gray-500 text-xs mt-1">Added March 15, 2024</div>
          </div>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add SSH Key
          </Button>
        </div>
      </div>
    </div>
  );

  const renderAccountSecretsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Account Secrets</h3>
        <p className="text-gray-400 text-sm mb-4">
          Manage environment variables and API keys for your projects.
        </p>
        <div className="space-y-3">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-white font-medium">OPENAI_API_KEY</div>
              <div className="text-gray-500 text-sm">sk-****************************</div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-white font-medium">DATABASE_URL</div>
              <div className="text-gray-500 text-sm">postgresql://****************************</div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Secret
          </Button>
        </div>
      </div>
    </div>
  );

  const renderConnectedServicesSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Connected Services</h3>
        <div className="space-y-3">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">GitHub</div>
                <div className="text-gray-400 text-sm">Connected</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Disconnect
            </Button>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-medium">Google Cloud</div>
                <div className="text-gray-400 text-sm">Not connected</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDomainsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Custom Domains</h3>
        <p className="text-gray-400 text-sm mb-4">
          Connect your custom domains to your Stargate projects.
        </p>
        <div className="space-y-3">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-medium">myapp.com</div>
              <Badge className="bg-green-600">Active</Badge>
            </div>
            <div className="text-gray-400 text-sm">Points to: stargate-project-123.replit.app</div>
          </div>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </Button>
        </div>
      </div>
    </div>
  );

  const renderThemesSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Themes</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 p-4 rounded-lg border-2 border-blue-600">
            <div className="w-full h-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded mb-2"></div>
            <div className="text-white font-medium">Dark (Current)</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-2 border-transparent hover:border-gray-600 cursor-pointer">
            <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-white rounded mb-2"></div>
            <div className="text-white font-medium">Light</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-2 border-transparent hover:border-gray-600 cursor-pointer">
            <div className="w-full h-16 bg-gradient-to-br from-purple-900 to-pink-900 rounded mb-2"></div>
            <div className="text-white font-medium">Synthwave</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-2 border-transparent hover:border-gray-600 cursor-pointer">
            <div className="w-full h-16 bg-gradient-to-br from-green-900 to-emerald-900 rounded mb-2"></div>
            <div className="text-white font-medium">Matrix</div>
          </div>
        </div>
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
      case 'teams':
        return renderTeamsSection();
      case 'settings':
        return renderSettingsSection();
      default:
        return renderProfileSection();
    }
  };

  // Always render but control visibility with transforms

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 h-full w-96 bg-gray-900 border-l border-gray-700 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ right: '0px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Account Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        </div>

        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-44 border-r border-gray-700 p-2">
            <nav className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}
