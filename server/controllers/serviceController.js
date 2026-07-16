import Service from "../models/Service.js";

export const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { serviceName, description, averageTime, isActive } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (serviceName !== undefined) {
      const trimmedName = serviceName.trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Service name is required",
        });
      }
      service.serviceName = trimmedName;
    }

    if (description !== undefined) {
      service.description = description.trim();
    }

    if (averageTime !== undefined) {
      const parsedAverageTime = Number(averageTime);
      if (!Number.isFinite(parsedAverageTime) || parsedAverageTime < 0) {
        return res.status(400).json({
          success: false,
          message: "Average time must be a valid non-negative number",
        });
      }
      service.averageTime = parsedAverageTime;
    }

    if (typeof isActive === "boolean") {
      service.isActive = isActive;
    }

    await service.save();

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getServicesByOrganization = async (req, res) => {
  try {
    const services = await Service.find({
      organization: req.params.organizationId,
    }).populate("organization", "name type");

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};