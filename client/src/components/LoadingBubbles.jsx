import { motion } from 'framer-motion';

const bubbleVariants = {
  initial: {
    y: '0%',
  },
  animate: {
    y: ['0%', '-100%', '0%'],
  },
};

const transition = {
  duration: 0.7,
  ease: 'easeInOut',
  repeat: Infinity,
};

const LoadingBubbles = () => {
  return (
    <motion.div
      className="flex justify-center items-center space-x-1 h-12"
      initial="initial"
      animate="animate"
      transition={{ staggerChildren: 0.2 }}
    >
      <motion.span
        className="block w-3 h-3 bg-purple-400 rounded-full"
        variants={bubbleVariants}
        transition={transition}
      />
      <motion.span
        className="block w-3 h-3 bg-purple-400 rounded-full"
        variants={bubbleVariants}
        transition={transition}
      />
      <motion.span
        className="block w-3 h-3 bg-purple-400 rounded-full"
        variants={bubbleVariants}
        transition={transition}
      />
    </motion.div>
  );
};

export default LoadingBubbles;
