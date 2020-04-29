import getEc2ComputePrice from "@salesforce/apex/OceanAwsPricingData.getEc2ComputePrice";
import getEbsStoragePrice from "@salesforce/apex/OceanAwsPricingData.getEbsStoragePrice";
import getEfsRequestPrice from "@salesforce/apex/OceanAwsPricingData.getEfsRequestPrice";
import getElbRequestPrice from "@salesforce/apex/OceanAwsPricingData.getElbRequestPrice";
import getEmrRequestPrice from "@salesforce/apex/OceanAwsPricingData.getEmrRequestPrice";
import getS3RequestPrice from "@salesforce/apex/OceanAwsPricingData.getS3RequestPrice";
import getRedshiftRequestPrice from "@salesforce/apex/OceanAwsPricingData.getRedshiftRequestPrice";
import getDynamoDBPrice from "@salesforce/apex/OceanAwsPricingData.getDynamoDBPrice";
import getDataTransferRequestPrice from "@salesforce/apex/OceanAwsPricingData.getDataTransferRequestPrice";
import getRdsRequestPrice from "@salesforce/apex/OceanAwsPricingData.getRdsRequestPrice";
import getRdsBkupRequestPrice from "@salesforce/apex/OceanAwsPricingData.getRdsBkupRequestPrice";
import getLambdaRequestPrice from "@salesforce/apex/OceanAwsPricingData.getLambdaRequestPrice";
import getWorkspaceRequestPrice from "@salesforce/apex/OceanAwsPricingData.getWorkspaceRequestPrice";

const getPricingByResourceType = (resourceType, fields) => {
  switch (resourceType) {
    case "EC2":
      return getEC2Price(fields);
    case "EBS":
      return getEBSPrice(fields);
    case "EFS":
      return getEFSPrice(fields);
    case "ELB":
      return getELBPrice(fields);
    case "EMR":
      return getEMRPrice(fields);
    case "VPC":
      return getVPCPrice(fields);
    case "S3":
      return getS3Price(fields);
    case "Redshift":
      return getRedshiftPrice(fields);
    case "DynamoDB":
      return getDynamodbPrice(fields);
    case "Data Transfer":
      return getDataTransferPrice(fields);
    case "RDS":
      return getRDSPrice(fields);
    case "RDS Backup Storage":
      return getRDSBackupStorage(fields);
    case "Lambda":
      return getLambdaPrice(fields);
    case "QuickSight":
      return getQuickSightPrice(fields);
    case "WorkSpaces":
      return getWorkspacePrice(fields);
    case "Other Service":
      return getOtherServicePrice(fields);
    default:
      break;
  }
};

const getOtherServicePrice = (fields) => {
  return new Promise((resolve, reject) => {
    resolve(0);
  });
};

const getWorkspacePrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getWorkspaceRequestPrice(getWorkspacesPricingRequestData(fields))
      .then((result) => {
        if (result) {
          cost = isNaN(parseFloat(result)) ? 0 : parseFloat(result);
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getQuickSightPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    try {
      let user = fields.User_Type__c.toLowerCase();
      const price = {
        author: 18,
        reader: 5,
        sessionReader: 0.3
      };

      const sessions = scaleFloat(fields.No_of_Sessions_per_UserMonth__c);
      const pCost =
        user === "author"
          ? price.author
          : sessions > 16
          ? price.reader
          : sessions * price.sessionReader;

      cost =
        parseInt(fields.No_of_Users__c, 10) *
        pCost *
        parseInt(fields.Number_of_Months_Requested__c, 10);
    } catch (error) {
      reject(error);
      cost = 0;
    }
    resolve(cost.toFixed(2));
  });
};

const getLambdaPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getLambdaRequestPrice({
      region: fields.AWS_Region__c
    })
      .then((result) => {
        if (result) {
          result.forEach((r) => {
            if (r.Unit__c === "Requests") {
              cost += Math.round(
                parseInt(fields.Number_of_Executions_per_Month__c, 10) *
                  parseFloat(r.PricePerUnit__c)
              );
            } else {
              let roundDuration =
                Math.ceil(
                  parseInt(fields.Estimated_Execution_Time_ms__c, 10) / 100
                ) * 100;
              roundDuration *= 0.001;
              let memoryInGB = parseFloat(fields.Allocated_Memory_MB__c) / 1024;
              cost += Math.round(
                parseInt(fields.Number_of_Executions_per_Month__c, 10) *
                  roundDuration *
                  memoryInGB *
                  parseFloat(r.PricePerUnit__c)
              );
            }
          });
          cost *= parseInt(fields.Number_of_Months_Requested__c, 10);
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getRDSBackupStorage = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getRdsBkupRequestPrice({
      region: fields.AWS_Region__c,
      databaseEngine:
        fields.Backup_Storage_Type__c === "Standard Backup"
          ? ""
          : fields.Backup_Storage_Type__c
    })
      .then((result) => {
        if (result) {
          cost =
            parseFloat(result.PricePerUnit__c) *
            parseFloat(fields.Additional_Backup_Storage_GB_Per_Month__c) *
            parseInt(fields.Number_of_Months_Requested__c, 10);
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getRDSPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getRdsRequestPrice(getRDSPricingRequestData(fields))
      .then((result) => {
        if (result) {
          cost = calculateRDSInstanceCost(fields, result);
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getDataTransferPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getDataTransferRequestPrice({
      region: fields.AWS_Region__c,
      transferType: fields.Data_Transfer_Type__c
    })
      .then((result) => {
        if (result) {
          cost = Math.round(
            parseFloat(result.PricePerUnit__c) *
              parseFloat(fields.Data_Transfer_Amount_GBMonth__c) *
              parseInt(fields.Number_of_Months_Requested__c, 10)
          );
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getDynamodbPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getDynamoDBPrice(getDynamoDBPricingRequestData(fields))
      .then((result) => {
        if (result) {
          cost = isNaN(parseFloat(result)) ? 0 : parseFloat(result).toFixed(2);
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getRedshiftPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getRedshiftRequestPrice(getRedshiftPricingRequestData(fields))
      .then((result) => {
        if (result) {
          result.forEach((r) => {
            cost +=
              r.Unit__c === "Quantity"
                ? scaleFloat(r.PricePerUnit__c) *
                  scaleInt(fields.Node_Quantity__c, 10)
                : scaleFloat(r.PricePerUnit__c) *
                  scaleFloat(fields.Usage_Hours_Per_Day__c) *
                  scaleInt(fields.Usage_Hours_Per_Month__c, 10) *
                  scaleInt(fields.Number_of_Months_Requested__c, 10) *
                  scaleInt(fields.Node_Quantity__c, 10);
          });
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getS3Price = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getS3RequestPrice(getS3PricingRequestData(fields))
      .then((result) => {
        if (result) cost = isNaN(parseFloat(result)) ? 0 : result.toFixed(2);
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getVPCPrice = (fields) => {
  return new Promise((resolve, reject) => {
    resolve(0);
  });
};

const getEMRPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getEmrRequestPrice(getPricingEMRRequestData(fields))
      .then((result) => {
        if (result) {
          cost = parseFloat(result).toFixed(2);
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getELBPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getElbRequestPrice({
      balancingType: fields.Load_Balancing_Type__c,
      region: fields.AWS_Region__c
    })
      .then((result) => {
        if (result) {
          result.forEach((r) => {
            cost +=
              r.Unit__c === "Hrs"
                ? parseFloat(r.PricePerUnit__c) *
                  730 *
                  parseInt(fields.Number_of_Months_Requested__c, 10) *
                  parseInt(fields.Number_Load_Balancers__c, 10)
                : parseFloat(fields.Data_Processed_per_Load_Balancer__c) *
                  0.0013 *
                  parseFloat(r.PricePerUnit__c) *
                  parseInt(fields.Number_of_Months_Requested__c, 10) *
                  parseInt(fields.Number_Load_Balancers__c, 10) *
                  730;
          });
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getEFSPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getEfsRequestPrice({
      storageType: fields.Storage_Type__c,
      region: fields.AWS_Region__c
    })
      .then((result) => {
        if (result) {
          let storageGBMonth = parseInt(
            fields.Total_Data_Storage_GBMonth__c,
            10
          );
          let monthsRequested = parseInt(
            fields.Number_of_Months_Requested__c,
            10
          );
          cost = parseFloat(result.PricePerUnit__c) * storageGBMonth;
          if (fields.Storage_Type__c !== "Infrequent Access") {
            let provisionedIOPS = parseInt(
              fields.Provisioned_Throughput_MBps__c,
              10
            );
            if (provisionedIOPS > 0) {
              let defaultThroughput = (storageGBMonth * 730) / 20;
              let billableThroughput =
                (provisionedIOPS * 730 - defaultThroughput) / 730;
              cost += Math.max(billableThroughput * 6, 0);
            }
          } else {
            let infrequentRequests = parseInt(
              fields.Infrequent_Access_Requests_GB__c,
              10
            );
            if (infrequentRequests > 0) cost += infrequentRequests * 0.01;
          }
          cost *= monthsRequested;
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

const getEBSPrice = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getEbsStoragePrice(getEBSPricingRequestData(fields))
      .then((result) => {
        cost = parseFloat(result);
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

/**
 *
 * @param {*} fields
 */
const getEC2Price = (fields) => {
  var cost = 0;
  return new Promise((resolve, reject) => {
    getEc2ComputePrice(getEC2PricingRequestData(fields))
      .then((result) => {
        if (result) {
          result.forEach((r) => {
            cost +=
              r.Unit__c === "Quantity"
                ? parseFloat(r.PricePerUnit__c) *
                  parseInt(fields.Instance_Quantity__c, 10)
                : parseFloat(r.PricePerUnit__c) *
                  parseFloat(fields.PerInstanceUptimePerDay__c) *
                  parseInt(fields.PerInstanceUptimePerMonth__c, 10) *
                  parseInt(
                    fields.Per_Instance_Running_Months_in_Remaining__c,
                    10
                  ) *
                  parseInt(fields.Instance_Quantity__c, 10);
          });
        }
        resolve(cost);
      })
      .catch((error) => reject(error));
  });
};

/**
 *
 * @param {*} fields
 */
const getEC2PricingRequestData = (fields) => {
  var platforms = fields.Platform__c.split(",").map((s) => s.trim());
  var [platform, preInstalledSW] = [
    platforms[0],
    platforms.length > 1 ? platforms[1] : ""
  ];
  var [offeringClass, termType, leaseContractLength, purchaseOption] = [
    "",
    "",
    "",
    ""
  ];
  var fundingTypes = fields.ADO_FUNDING_TYPE__c.split(",").map((s) => s.trim());

  if (fundingTypes.length > 1)
    [offeringClass, termType, leaseContractLength, purchaseOption] = [
      fundingTypes[0],
      fundingTypes[1],
      fundingTypes[2],
      fundingTypes[3]
    ];
  else termType = fundingTypes[0];

  return {
    pricingRequest: {
      platform: platform,
      preInstalledSW: preInstalledSW,
      tenancy: fields.Tenancy__c,
      region: fields.AWS_Region__c,
      instanceType: fields.EC2_Instance_Type__c,
      offeringClass: offeringClass,
      termType: termType,
      leaseContractLength: leaseContractLength,
      purchaseOption: purchaseOption
    }
  };
};

const getEBSPricingRequestData = (instance) => {
  var types = instance.Volume_Type__c.split(",").map((s) => s.trim());
  var [volumeType, storageMedia] = [types[0], types[1]];

  return {
    pricingRequest: {
      volumeType: volumeType,
      storageMedia: storageMedia,
      region: instance.AWS_Region__c,
      storageSize: instance.Storage_Size_GB__c,
      noOfVolume: instance.Number_of_Volumes__c,
      numberOfMonths: instance.Number_of_Months_Requested__c,
      snapshotStorage:
        instance.Snapshot_Storage_GB_Per_Month__c === null ||
        instance.Snapshot_Storage_GB_Per_Month__c === undefined
          ? 0
          : instance.Snapshot_Storage_GB_Per_Month__c,
      iops:
        instance.IOPS__c === null || instance.IOPS__c === undefined
          ? 0
          : instance.IOPS__c,
      snapshotFrequency:
        instance.Snapshot_Frequency__c === null ||
        instance.Snapshot_Frequency__c === undefined
          ? ""
          : instance.Snapshot_Frequency__c,
      averageDuration: instance.Average_duration__c
    }
  };
};

const getPricingEMRRequestData = (instance) => {
  var [offeringClass, termType, leaseContractLength, purchaseOption] = [
    "",
    "",
    "",
    ""
  ];
  var fundingTypes = instance.Funding_Type__c.split(",").map((s) => s.trim());

  if (fundingTypes.length > 1)
    [offeringClass, termType, leaseContractLength, purchaseOption] = [
      fundingTypes[0],
      fundingTypes[1],
      fundingTypes[2],
      fundingTypes[3]
    ];
  else termType = fundingTypes[0];

  return {
    pricingRequest: {
      hadoopDistributionType: instance.Hadoop_Distribution__c,
      region: instance.AWS_Region__c,
      instanceType: instance.Instance_Type__c,
      offeringClass: offeringClass,
      termType: termType,
      leaseContractLength: leaseContractLength,
      purchaseOption: purchaseOption,
      instanceQuantity: instance.Instance_Quantity__c,
      uptimePerDay: instance.Uptime_HoursDay__c,
      uptimePerMonth: instance.Uptime_DaysMonth__c,
      monthsRequested: instance.Number_of_Months_Requested__c
    }
  };
};

const getS3PricingRequestData = (fields) => {
  return {
    pricingRequest: {
      volumeType: fields.Storage_Type__c,
      region: fields.AWS_Region__c,
      noPutCopyListRequests: parseInt(fields.PUTCOPYPOSTLIST_Requests__c, 10),
      noGetRequests: parseInt(fields.GETSELECT_and_Other_Requests__c, 10),
      requestedMonths: parseInt(fields.Number_of_Months_Requested__c, 10),
      storageSize: parseInt(fields.Total_Storage_GBMonth__c, 10)
    }
  };
};

const getRedshiftPricingRequestData = (instance) => {
  var [offeringClass, termType, leaseContractLength, purchaseOption] = [
    "",
    "",
    "",
    ""
  ];
  var fundingTypes = instance.Funding_Type__c.split(",").map((s) => s.trim());

  if (fundingTypes.length > 1) {
    [offeringClass, termType, leaseContractLength, purchaseOption] = [
      fundingTypes[0],
      fundingTypes[1],
      fundingTypes[2],
      fundingTypes[3]
    ];
  } else {
    termType = fundingTypes[0];
  }

  return {
    pricingRequest: {
      region: instance.AWS_Region__c,
      instanceType: instance.Redshift_Type__c,
      offeringClass: offeringClass,
      termType: termType,
      leaseContractLength: leaseContractLength,
      purchaseOption: purchaseOption
    }
  };
};

const getDynamoDBPricingRequestData = (instance) => {
  var params = instance.Capacity_Type__c.split(",").map((s) => s.trim());
  var [termType, leaseContractLength] = [
    params[0],
    params.length > 1 ? params[1] : ""
  ];
  return {
    pricingRequest: {
      readUnits: instance.Read_Capacity_Units_per_Month__c,
      dataStorage: instance.Total_Data_Storage_GBMonth__c,
      writeUnits: instance.Write_Capacity_Units_per_Month__c,
      region: instance.AWS_Region__c,
      numberOfMonths: instance.Number_of_Months_Requested__c,
      termType: termType,
      leaseContractLength: leaseContractLength
    }
  };
};

const getRDSPricingRequestData = (instance) => {
  var dbs = instance.DB_Engine_License__c.split(",").map((s) => s.trim());
  var [db, dbEdition, dbLicense] = [dbs[0], "", ""];
  var [offeringClass, termType, leaseContractLength, purchaseOption] = [
    "",
    "",
    "",
    ""
  ];
  var fundingTypes = instance.Funding_Type__c.split(",").map((s) => s.trim());
  if (dbs.length === 2) {
    dbLicense = dbs[1];
  } else if (dbs.length > 2) {
    [dbEdition, dbLicense] = [dbs[1], dbs[2]];
  }
  if (fundingTypes.length > 1) {
    [offeringClass, termType, leaseContractLength, purchaseOption] = [
      fundingTypes[0],
      fundingTypes[1],
      fundingTypes[2],
      fundingTypes[3]
    ];
  } else {
    termType = fundingTypes[0];
  }
  return {
    pricingRequest: {
      databaseEngine: db,
      licenseModel: dbLicense,
      databaseEdition: dbEdition,
      termType: termType,
      leaseContractLength: leaseContractLength,
      purchaseOption: purchaseOption,
      offeringClass: offeringClass,
      region: instance.AWS_Region__c,
      instanceType: instance.InstanceType__c,
      deploymentOption: instance.Deployment__c
    }
  };
};

const calculateRDSInstanceCost = (fields, result) => {
  var cost = 0;
  const instanceQuantity = parseInt(fields.Instance_Quantity__c, 10);
  const monthsRequested = parseInt(fields.Number_of_Months_Requested__c, 10);
  result.forEach((r) => {
    cost +=
      r.Unit__c === "Quantity"
        ? parseFloat(r.PricePerUnit__c) *
          parseInt(fields.Instance_Quantity__c, 10)
        : parseFloat(r.PricePerUnit__c) *
          parseInt(fields.Per_Instance_Uptime_HoursDay__c, 10) *
          parseInt(fields.Per_Instance_Uptime_DaysMonth__c, 10) *
          instanceQuantity  ;
  });

  const storageSize = parseInt(fields.Storage_Size_GB__c, 10);
  const iops = isNaN(parseInt(fields.Provisioned_IOPS__c, 10))
    ? 0
    : parseInt(fields.Provisioned_IOPS__c, 10);
  let storageCost = 0;
  switch (fields.Storage_Type__c) {
    case "General Purpose (SSD)":
      storageCost =
        fields.Deployment__c === "Single-AZ"
          ? 0.115 * storageSize
          : 0.23 * storageSize;
      break;
    case "Provisioned IOPS (SSD)":
      storageCost =
        fields.Deployment__c === "Single-AZ"
          ? 0.125 * storageSize + 0.1 * iops
          : 0.25 * storageSize + 0.2 * iops;
      break;
    case "Magnetic":
      storageCost =
        fields.Deployment__c === "Single-AZ"
          ? 0.1 * storageSize
          : 0.2 * storageSize;
      break;
    default:
      break;
  }

  if(cost > 0.00) {
    cost = fields.Funding_Type__c === 'OnDemand' ? (cost+storageCost) * instanceQuantity  * monthsRequested : cost+(storageCost*monthsRequested) * instanceQuantity;
  }

    return cost;
};

const getWorkspacesPricingRequestData = (instance) => {
  var params = instance.License__c.split(",").map((s) => s.trim());
  return {
    pricingRequest: {
      billingOption: instance.Billing_Options__c,
      operatingSystem: params[0],
      license: params[1],
      region: instance.AWS_Region__c,
      storage: instance.Root_Volume_User_Volume__c,
      bundle: instance.Workspace_Bundle__c,
      additionalStorage: instance.Additional_Storage_per_User_GB__c,
      noOfWorkspaces: instance.Number_of_Workspaces__c,
      monthsRequested: instance.Number_of_Months_Requested__c,
      hoursRequested: instance.Usage_Hours_Month_per_WorkSpace__c
    }
  };
};

const scaleInt = (x, base) => {
  var parsed = parseInt(x, base);
  return isNaN(parsed) ? 1 : parsed;
};

const scaleFloat = (x) => {
  var parsed = parseFloat(x);
  return isNaN(parsed) ? 1 : parsed;
};

/**
 * Single pricing service for the different AWS Resources
 */
export { getPricingByResourceType };
