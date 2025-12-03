import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ALL_ROLES } from '@/types/nova';
import { toast } from '@/hooks/use-toast';

export function AuthPage() {
  const { signIn, signUp, updateProfile, user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please enter email and password", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    // Try sign in first
    let { error } = await signIn(email, password);
    
    // If failed, try sign up
    if (error?.message?.includes('Invalid login credentials')) {
      const signUpResult = await signUp(email, password);
      if (signUpResult.error) {
        toast({ title: "Error", description: signUpResult.error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      // After signup, sign in
      const signInResult = await signIn(email, password);
      error = signInResult.error;
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setShowRoleSelection(true);
    }
    setLoading(false);
  };

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast({ title: "Error", description: "Please select a role", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await updateProfile(selectedRole);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Profile created successfully!" });
    }
    setLoading(false);
  };

  // Show role selection if user exists but no profile
  if (user && !profile && !showRoleSelection) {
    setShowRoleSelection(true);
  }

  if (showRoleSelection && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 50%, hsl(43 74% 49% / 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(43 74% 49% / 0.05) 0%, transparent 50%)' }} />
        
        <div className="nova-card w-full max-w-lg p-8 animate-fade-in relative z-10">
          <h1 className="nova-title text-4xl text-primary text-center mb-2">NOVA</h1>
          <p className="text-muted-foreground text-center mb-8">Select your role in the production</p>
          
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">Your Role</Label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-3 bg-background/40 border border-primary/30 rounded-md text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Select your role...</option>
                <optgroup label="Leadership">
                  {['Producer', 'Executive Producer', 'Line Producer', 'Director', 'Assistant Director'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
                <optgroup label="Production">
                  {['Production Manager', 'Production Coordinator', 'Production Assistant'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
                <optgroup label="Camera">
                  {['Director of Photography', 'Camera Operator', '1st AC', '2nd AC', 'DIT'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
                <optgroup label="Lighting">
                  {['Gaffer', 'Best Boy Electric', 'Key Grip'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
                <optgroup label="Sound">
                  {['Production Sound Mixer', 'Boom Operator', 'Sound Designer'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
                <optgroup label="Art & Design">
                  {['Production Designer', 'Art Director', 'Set Decorator', 'Props Master'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
                <optgroup label="Costume & Makeup">
                  {['Costume Designer', 'Makeup Department Head', 'Hair Department Head'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
                <optgroup label="Post-Production">
                  {['Editor', 'Colorist', 'VFX Supervisor', 'VFX Artist'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
                <optgroup label="Other">
                  {['Location Manager', 'Casting Director', 'Composer', 'Viewer'].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <Button 
              onClick={handleRoleSelection} 
              disabled={loading || !selectedRole}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
            >
              {loading ? 'Saving...' : 'Confirm Role'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 50%, hsl(43 74% 49% / 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(43 74% 49% / 0.05) 0%, transparent 50%)' }} />
      
      <div className="nova-card w-full max-w-md p-8 animate-fade-in relative z-10">
        <h1 className="nova-title text-5xl text-primary text-center mb-2">NOVA</h1>
        <p className="text-muted-foreground text-center mb-8">Professional Film Production Platform</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-background/40 border-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold uppercase tracking-wide mb-2 block">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="bg-background/40 border-primary/30 focus:border-primary"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
          >
            {loading ? 'Processing...' : 'Login / Sign Up'}
          </Button>
        </form>
      </div>
    </div>
  );
}
