import Queue from "../models/Queue.js";
import Service from "../models/Service.js";

export const generateToken = async (req, res) => {
  try {
    const { organization, service } = req.body;

    // Check required fields
    if (!organization || !service) {
      return res.status(400).json({
        success: false,
        message: "Organization and Service are required",
      });
    }

    // Find selected service
    const selectedService = await Service.findById(service);

    if (!selectedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Count waiting customers
    const waitingCount = await Queue.countDocuments({
      organization,
      service,
      status: "Waiting",
    });

    // Generate token number
    const tokenNumber = waitingCount + 1;

    // Calculate waiting time
    const estimatedWaitTime =
      waitingCount * selectedService.averageTime;

    // Save queue
    const queue = await Queue.create({
      organization,
      service,
      user: req.user.id,
      tokenNumber,
      estimatedWaitTime,
    });

    await queue.populate("organization", "name");
    await queue.populate("service", "serviceName");

    res.status(201).json({
  success: true,
  message: "Token generated successfully",
  data: {
    tokenId: queue._id,
    tokenNumber: queue.tokenNumber,
    queuePosition: waitingCount + 1,
    estimatedWaitTime: queue.estimatedWaitTime,
    status: queue.status,
    organization: {
      id: queue.organization._id,
      name: queue.organization.name,
    },
    service: {
      id: queue.service._id,
      name: queue.service.serviceName,
    },
  },
});

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getQueue = async (req, res) => {
  try {
    const { organizationId, serviceId } = req.params;

    const queue = await Queue.find({
      organization: organizationId,
      service: serviceId,
    })
      .populate("user", "name email")
      .sort({ tokenNumber: 1 });

    res.status(200).json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const callNextToken = async (req, res) => {
  try {
    const { organization, service } = req.body;

    // Check if someone is already being served
    const servingToken = await Queue.findOne({
      organization,
      service,
      status: "Serving",
    });

    if (servingToken) {
      return res.status(400).json({
        success: false,
        message: "A token is already being served.",
      });
    }

    // Find the next waiting token
    const nextToken = await Queue.findOne({
      organization,
      service,
      status: "Waiting",
    }).sort({ tokenNumber: 1 });

    if (!nextToken) {
      return res.status(404).json({
        success: false,
        message: "No waiting tokens found.",
      });
    }

    nextToken.status = "Serving";
    await nextToken.save();

    res.status(200).json({
      success: true,
      message: "Next token called successfully",
      token: nextToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const completeToken = async (req, res) => {
  try {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue token not found",
      });
    }

    if (queue.status !== "Serving") {
      return res.status(400).json({
        success: false,
        message: "Only a serving token can be completed",
      });
    }

    queue.status = "Completed";
    await queue.save();

    res.status(200).json({
      success: true,
      message: "Token completed successfully",
      queue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const { organization, service } = req.query;

    // Current Serving Token
    const currentServing = await Queue.findOne({
      organization,
      service,
      status: "Serving",
    })
      .populate("user", "name")
      .sort({ tokenNumber: 1 });

    // Next Waiting Token
    const nextWaiting = await Queue.findOne({
      organization,
      service,
      status: "Waiting",
    }).sort({ tokenNumber: 1 });

    // Counts
    const waitingCount = await Queue.countDocuments({
      organization,
      service,
      status: "Waiting",
    });

    const completedCount = await Queue.countDocuments({
      organization,
      service,
      status: "Completed",
    });

    const totalTokens = await Queue.countDocuments({
      organization,
      service,
    });

    res.status(200).json({
  success: true,
  dashboard: {
    currentServing: currentServing
      ? {
          tokenNumber: currentServing.tokenNumber,
          customer: currentServing.user.name,
        }
      : null,

    nextToken: nextWaiting
      ? nextWaiting.tokenNumber
      : null,

    waitingCount,
    completedCount,
    totalTokens,
  },
});

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyQueue = async (req, res) => {
  try {
    const queue = await Queue.findOne({
      user: req.user.id,
      status: { $in: ["Waiting", "Serving"] },
    })
      .populate("organization", "name")
      .populate("service", "serviceName")
      .sort({ createdAt: -1 });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "No active queue found",
      });
    }

    const queuePosition = await Queue.countDocuments({
      organization: queue.organization._id,
      service: queue.service._id,
      status: "Waiting",
      tokenNumber: { $lt: queue.tokenNumber },
    });

    res.json({
      success: true,
      data: {
        tokenId: queue._id,
        tokenNumber: queue.tokenNumber,
        organization: queue.organization.name,
        service: queue.service.serviceName,
        status: queue.status,
        estimatedWaitTime: queue.estimatedWaitTime,
        queuePosition: queuePosition + 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelToken = async (req, res) => {
  try {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId);

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: "Queue token not found",
      });
    }

    // Only owner or admin can cancel
    if (
      queue.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this token",
      });
    }

    if (queue.status !== "Waiting") {
      return res.status(400).json({
        success: false,
        message: "Only waiting tokens can be cancelled",
      });
    }

    queue.status = "Cancelled";
    await queue.save();

    res.status(200).json({
      success: true,
      message: "Token cancelled successfully",
      queue,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};