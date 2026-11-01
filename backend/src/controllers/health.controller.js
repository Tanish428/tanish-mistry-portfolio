import mongoose from 'mongoose';

export const getLiveness = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Application is running',
    data: {
      status: 'alive',
    },
  });
};

export const getReadiness = (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  if (isConnected) {
    return res.status(200).json({
      success: true,
      message: 'Application is ready',
      data: {
        status: 'ready',
        database: 'connected',
      },
    });
  }

  res.status(503).json({
    success: false,
    message: 'Application is not ready',
    data: {
      status: 'not_ready',
      database: 'disconnected',
    },
  });
};
