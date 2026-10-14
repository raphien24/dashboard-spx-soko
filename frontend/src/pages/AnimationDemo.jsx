import { 
  FadeIn, 
  ScaleIn, 
  StaggerChildren, 
  StaggerItem, 
  AnimatedCounter,
  AnimatedButton,
  FloatingElement,
  GlassCard,
  SkeletonLoader 
} from '../components/animations';
import { 
  Rocket, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Package,
  Target,
  Activity
} from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';

/**
 * Animation Demo Page
 * Showcase all animation components and effects
 */
const AnimationDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <FadeIn direction="down" duration={0.6}>
          <div className="text-center py-12">
            <FloatingElement duration={4} yOffset={15}>
              <Sparkles className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            </FloatingElement>
            <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4">
              Modern Animations
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-400 mb-6">
              GPT-6 Astra Style • Smooth • Professional
            </p>
            <div className="flex items-center justify-center gap-4">
              <AnimatedButton variant="primary">
                <Rocket className="w-5 h-5 inline mr-2" />
                Get Started
              </AnimatedButton>
              <AnimatedButton variant="secondary">
                Learn More
              </AnimatedButton>
            </div>
          </div>
        </FadeIn>

        {/* Counter Demo */}
        <ScaleIn delay={0.2}>
          <GlassCard className="p-8" glow>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Animated Counters
            </h2>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <AnimatedCounter 
                  value={1234} 
                  className="text-5xl font-black text-indigo-600"
                  duration={2000}
                />
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">Total Packages</p>
              </div>
              <div className="text-center">
                <AnimatedCounter 
                  value={95.5} 
                  decimals={1}
                  suffix="%"
                  className="text-5xl font-black text-green-600"
                  duration={2000}
                />
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">Success Rate</p>
              </div>
              <div className="text-center">
                <AnimatedCounter 
                  value={45} 
                  className="text-5xl font-black text-blue-600"
                  duration={2000}
                />
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">Active Users</p>
              </div>
              <div className="text-center">
                <AnimatedCounter 
                  value={23500} 
                  prefix="$"
                  className="text-5xl font-black text-purple-600"
                  duration={2500}
                />
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">Revenue</p>
              </div>
            </div>
          </GlassCard>
        </ScaleIn>

        {/* KPI Cards with Stagger */}
        <div>
          <FadeIn direction="up" delay={0.3}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Animated KPI Cards
            </h2>
          </FadeIn>
          
          <StaggerChildren staggerDelay={0.15} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StaggerItem>
              <KPICard
                title="Total Delivered"
                value={1234}
                unit="packages delivered this month"
                target={1500}
                percentage={82.3}
                trend="up"
                color="purple"
                icon={Package}
                delay={0}
                subMetrics={{
                  'Today': '45 pkgs',
                  'This Week': '312 pkgs',
                  'Avg Daily': '41.1 pkgs'
                }}
              />
            </StaggerItem>

            <StaggerItem>
              <KPICard
                title="Active Couriers"
                value={45}
                unit="couriers active today"
                target={50}
                percentage={90}
                trend="up"
                color="blue"
                icon={Users}
                delay={1}
                subMetrics={{
                  'Dedicated': '32',
                  'Plus': '13',
                  'On Leave': '5'
                }}
              />
            </StaggerItem>

            <StaggerItem>
              <KPICard
                title="Success Rate"
                value={95.5}
                unit="delivery success rate"
                target={100}
                percentage={95.5}
                color="green"
                icon={Target}
                delay={2}
                subMetrics={{
                  'Delivered': '1175',
                  'Failed': '59',
                  'Pending': '0'
                }}
              />
            </StaggerItem>

            <StaggerItem>
              <KPICard
                title="Avg Productivity"
                value={27.4}
                unit="packages per courier per day"
                target={30}
                percentage={91.3}
                trend="down"
                color="indigo"
                icon={TrendingUp}
                delay={3}
                subMetrics={{
                  'Peak': '42 pkgs',
                  'Low': '15 pkgs',
                  'Median': '26 pkgs'
                }}
              />
            </StaggerItem>

            <StaggerItem>
              <KPICard
                title="Daily Active"
                value={78.5}
                unit="percentage of active couriers"
                target={80}
                percentage={98.1}
                color="purple"
                icon={Activity}
                delay={4}
                subMetrics={{
                  'Today': '45/50',
                  'Yesterday': '47/50',
                  'Avg': '46/50'
                }}
              />
            </StaggerItem>

            <StaggerItem>
              <KPICard
                title="On-Time Delivery"
                value={89}
                unit="deliveries on time"
                target={95}
                percentage={93.7}
                trend="up"
                color="blue"
                icon={Package}
                delay={5}
                subMetrics={{
                  'Early': '234',
                  'On Time': '850',
                  'Late': '91'
                }}
              />
            </StaggerItem>
          </StaggerChildren>
        </div>

        {/* Glass Cards */}
        <div>
          <FadeIn direction="right" delay={0.4}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Glassmorphism Cards
            </h2>
          </FadeIn>

          <div className="grid grid-cols-3 gap-6">
            <ScaleIn delay={0.5}>
              <GlassCard className="p-6" hover glow>
                <Sparkles className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Modern Design
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Glassmorphism with backdrop blur and smooth animations.
                </p>
              </GlassCard>
            </ScaleIn>

            <ScaleIn delay={0.6}>
              <GlassCard className="p-6" hover>
                <Rocket className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Fast Performance
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  60 FPS animations with GPU acceleration.
                </p>
              </GlassCard>
            </ScaleIn>

            <ScaleIn delay={0.7}>
              <GlassCard className="p-6" hover glow>
                <Target className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  User Focused
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  Respects user motion preferences and accessibility.
                </p>
              </GlassCard>
            </ScaleIn>
          </div>
        </div>

        {/* Loading Skeletons */}
        <FadeIn direction="left" delay={0.5}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Loading Skeletons
            </h2>
            <div className="space-y-4">
              <SkeletonLoader variant="title" />
              <div className="grid grid-cols-3 gap-4">
                <SkeletonLoader variant="card" />
                <SkeletonLoader variant="card" />
                <SkeletonLoader variant="card" />
              </div>
              <SkeletonLoader variant="text" count={4} />
            </div>
          </div>
        </FadeIn>

        {/* Buttons */}
        <ScaleIn delay={0.6}>
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Interactive Buttons
            </h2>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <AnimatedButton variant="primary">
                Primary Action
              </AnimatedButton>
              <AnimatedButton variant="secondary">
                Secondary
              </AnimatedButton>
              <AnimatedButton variant="success">
                Success
              </AnimatedButton>
              <AnimatedButton variant="danger">
                Danger
              </AnimatedButton>
            </div>
          </div>
        </ScaleIn>

        {/* Footer */}
        <FadeIn direction="up" delay={0.7}>
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-slate-400 text-lg">
              Scroll up and down to see animations trigger ✨
            </p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">
              Built with Framer Motion • React Spring • Intersection Observer
            </p>
          </div>
        </FadeIn>

      </div>
    </div>
  );
};

export default AnimationDemo;
