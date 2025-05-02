// Mock data for development until the backend is ready
const mockData = {
    industryGroups: [
      "Transportation",
      "Leisure",
      "Consumer Foods & Retail",
      "Financial Services",
      "Property",
      "Information Technology"
    ],
    
    yearlyData: [
      {
        year: 2019,
        industryGroups: ["Transportation", "Leisure", "Consumer Foods & Retail", "Financial Services", "Property", "Information Technology"],
        financials: {
          revenue: 135500,
          costOfSales: 98250,
          operatingExpenses: 12750,
          grossProfit: 37250,
          netProfit: 14850,
          eps: 11.23,
          outstandingShares: 1322,
          totalAssets: 158750,
          totalLiabilities: 52500,
          netAssetPerShare: 80.37,
          industryBenchmarkNAPS: 78.12
        },
        events: [
          {
            title: "Easter Sunday Attacks",
            description: "Impact on tourism and leisure sectors",
            impact: "negative",
            date: "2019-04-21"
          }
        ]
      },
      {
        year: 2020,
        industryGroups: ["Transportation", "Leisure", "Consumer Foods & Retail", "Financial Services", "Property", "Information Technology"],
        financials: {
          revenue: 105250,
          costOfSales: 79875,
          operatingExpenses: 11850,
          grossProfit: 25375,
          netProfit: 6825,
          eps: 5.16,
          outstandingShares: 1322,
          totalAssets: 152250,
          totalLiabilities: 55750,
          netAssetPerShare: 73.00,
          industryBenchmarkNAPS: 70.25
        },
        events: [
          {
            title: "COVID-19 Pandemic",
            description: "Global lockdowns affecting operations",
            impact: "negative",
            date: "2020-03-15"
          },
          {
            title: "Government Relief",
            description: "Tax relief measures announced",
            impact: "positive",
            date: "2020-06-10"
          }
        ]
      },
      {
        year: 2021,
        industryGroups: ["Transportation", "Leisure", "Consumer Foods & Retail", "Financial Services", "Property", "Information Technology"],
        financials: {
          revenue: 110750,
          costOfSales: 80500,
          operatingExpenses: 11250,
          grossProfit: 30250,
          netProfit: 9125,
          eps: 6.90,
          outstandingShares: 1322,
          totalAssets: 157500,
          totalLiabilities: 53250,
          netAssetPerShare: 78.86,
          industryBenchmarkNAPS: 75.44
        },
        events: [
          {
            title: "Vaccination Programs",
            description: "Improved business sentiment",
            impact: "positive",
            date: "2021-04-05"
          }
        ]
      },
      {
        year: 2022,
        industryGroups: ["Transportation", "Leisure", "Consumer Foods & Retail", "Financial Services", "Property", "Information Technology"],
        financials: {
          revenue: 118250,
          costOfSales: 83750,
          operatingExpenses: 10875,
          grossProfit: 34500,
          netProfit: 11750,
          eps: 8.89,
          outstandingShares: 1322,
          totalAssets: 165000,
          totalLiabilities: 51750,
          netAssetPerShare: 85.67,
          industryBenchmarkNAPS: 82.21
        },
        events: [
          {
            title: "Recovery Phase",
            description: "Business returning to pre-pandemic levels",
            impact: "positive",
            date: "2022-01-15"
          },
          {
            title: "Economic Crisis",
            description: "Sri Lanka economic crisis",
            impact: "negative",
            date: "2022-03-31"
          }
        ]
      },
      {
        year: 2023,
        industryGroups: ["Transportation", "Leisure", "Consumer Foods & Retail", "Financial Services", "Property", "Information Technology"],
        financials: {
          revenue: 124750,
          costOfSales: 86500,
          operatingExpenses: 10500,
          grossProfit: 38250,
          netProfit: 14250,
          eps: 10.78,
          outstandingShares: 1322,
          totalAssets: 172750,
          totalLiabilities: 50250,
          netAssetPerShare: 92.66,
          industryBenchmarkNAPS: 88.75
        },
        events: [
          {
            title: "Tourism Resurgence",
            description: "Strong recovery in tourism sector",
            impact: "positive",
            date: "2023-02-10"
          }
        ]
      },
      {
        year: 2024,
        industryGroups: ["Transportation", "Leisure", "Consumer Foods & Retail", "Financial Services", "Property", "Information Technology"],
        financials: {
          revenue: 132250,
          costOfSales: 90250,
          operatingExpenses: 10125,
          grossProfit: 42000,
          netProfit: 17375,
          eps: 13.14,
          outstandingShares: 1322,
          totalAssets: 181500,
          totalLiabilities: 49000,
          netAssetPerShare: 100.23,
          industryBenchmarkNAPS: 95.44
        },
        events: [
          {
            title: "Strategic Acquisitions",
            description: "Expansion in IT and retail sectors",
            impact: "positive",
            date: "2024-01-22"
          },
          {
            title: "Digital Transformation",
            description: "Completion of major digital initiatives",
            impact: "positive",
            date: "2024-06-15"
          }
        ]
      }
    ],
    
    // Right Issues data
    rightIssues: [
      {
        year: 2019,
        ratio: "2:1",
        issuePrice: 175.50,
        description: "To fund expansion in retail sector"
      },
      {
        year: 2021,
        ratio: "3:1",
        issuePrice: 140.75,
        description: "To strengthen balance sheet after pandemic"
      },
      {
        year: 2023,
        ratio: "4:1",
        issuePrice: 215.25,
        description: "To fund strategic acquisitions in IT sector"
      }
    ],
    
    // Shareholders data
    shareholders: [
      {
        year: 2019,
        data: [
          { name: "John Keells Holdings PLC", percentage: 18.7 },
          { name: "Employees Provident Fund", percentage: 12.5 },
          { name: "National Savings Bank", percentage: 7.2 },
          { name: "Bank of Ceylon", percentage: 5.8 },
          { name: "Sri Lanka Insurance Corporation Ltd.", percentage: 4.9 },
          { name: "Hatton National Bank PLC", percentage: 4.2 },
          { name: "HSBC International Nominees Ltd.", percentage: 3.8 },
          { name: "Employees Trust Fund", percentage: 3.5 },
          { name: "Melstacorp PLC", percentage: 3.1 },
          { name: "AIA Insurance Lanka Ltd.", percentage: 2.8 },
          { name: "Carson Cumberbatch PLC", percentage: 2.5 },
          { name: "DFCC Bank PLC", percentage: 2.3 },
          { name: "Commercial Bank of Ceylon PLC", percentage: 2.1 },
          { name: "NDB Bank PLC", percentage: 1.9 },
          { name: "Sampath Bank PLC", percentage: 1.7 },
          { name: "Ceylon Guardian Investment Trust PLC", percentage: 1.5 },
          { name: "Mercantile Investments and Finance PLC", percentage: 1.3 },
          { name: "Life Insurance Corporation of India", percentage: 1.2 },
          { name: "Softlogic Holdings PLC", percentage: 1.1 },
          { name: "Lanka ORIX Leasing Company PLC", percentage: 1.0 }
        ]
      },
      {
        year: 2020,
        data: [
          { name: "John Keells Holdings PLC", percentage: 19.2 },
          { name: "Employees Provident Fund", percentage: 13.1 },
          { name: "National Savings Bank", percentage: 7.5 },
          { name: "Bank of Ceylon", percentage: 6.1 },
          { name: "Sri Lanka Insurance Corporation Ltd.", percentage: 5.3 },
          { name: "Hatton National Bank PLC", percentage: 4.0 },
          { name: "HSBC International Nominees Ltd.", percentage: 3.7 },
          { name: "Employees Trust Fund", percentage: 3.4 },
          { name: "Melstacorp PLC", percentage: 3.0 },
          { name: "AIA Insurance Lanka Ltd.", percentage: 2.7 },
          { name: "Carson Cumberbatch PLC", percentage: 2.4 },
          { name: "DFCC Bank PLC", percentage: 2.2 },
          { name: "Commercial Bank of Ceylon PLC", percentage: 2.0 },
          { name: "NDB Bank PLC", percentage: 1.8 },
          { name: "Sampath Bank PLC", percentage: 1.6 },
          { name: "Ceylon Guardian Investment Trust PLC", percentage: 1.4 },
          { name: "Mercantile Investments and Finance PLC", percentage: 1.2 },
          { name: "Life Insurance Corporation of India", percentage: 1.1 },
          { name: "Softlogic Holdings PLC", percentage: 1.0 },
          { name: "Lanka ORIX Leasing Company PLC", percentage: 0.9 }
        ]
      },
      {
        year: 2021,
        data: [
          { name: "John Keells Holdings PLC", percentage: 20.5 },
          { name: "Employees Provident Fund", percentage: 13.8 },
          { name: "National Savings Bank", percentage: 7.7 },
          { name: "Bank of Ceylon", percentage: 6.3 },
          { name: "Sri Lanka Insurance Corporation Ltd.", percentage: 5.7 },
          { name: "Hatton National Bank PLC", percentage: 3.8 },
          { name: "HSBC International Nominees Ltd.", percentage: 3.5 },
          { name: "Employees Trust Fund", percentage: 3.3 },
          { name: "Melstacorp PLC", percentage: 2.9 },
          { name: "AIA Insurance Lanka Ltd.", percentage: 2.6 },
          { name: "Carson Cumberbatch PLC", percentage: 2.3 },
          { name: "DFCC Bank PLC", percentage: 2.1 },
          { name: "Commercial Bank of Ceylon PLC", percentage: 1.9 },
          { name: "NDB Bank PLC", percentage: 1.7 },
          { name: "Sampath Bank PLC", percentage: 1.5 },
          { name: "Ceylon Guardian Investment Trust PLC", percentage: 1.3 },
          { name: "Mercantile Investments and Finance PLC", percentage: 1.1 },
          { name: "Life Insurance Corporation of India", percentage: 1.0 },
          { name: "Softlogic Holdings PLC", percentage: 0.9 },
          { name: "Lanka ORIX Leasing Company PLC", percentage: 0.8 }
        ]
      },
      {
        year: 2022,
        data: [
          { name: "John Keells Holdings PLC", percentage: 21.2 },
          { name: "Employees Provident Fund", percentage: 14.5 },
          { name: "National Savings Bank", percentage: 8.1 },
          { name: "Bank of Ceylon", percentage: 6.6 },
          { name: "Sri Lanka Insurance Corporation Ltd.", percentage: 6.1 },
          { name: "Hatton National Bank PLC", percentage: 3.6 },
          { name: "HSBC International Nominees Ltd.", percentage: 3.3 },
          { name: "Employees Trust Fund", percentage: 3.1 },
          { name: "Melstacorp PLC", percentage: 2.7 },
          { name: "AIA Insurance Lanka Ltd.", percentage: 2.4 },
          { name: "Carson Cumberbatch PLC", percentage: 2.1 },
          { name: "DFCC Bank PLC", percentage: 1.9 },
          { name: "Commercial Bank of Ceylon PLC", percentage: 1.7 },
          { name: "NDB Bank PLC", percentage: 1.5 },
          { name: "Sampath Bank PLC", percentage: 1.3 },
          { name: "Ceylon Guardian Investment Trust PLC", percentage: 1.1 },
          { name: "Mercantile Investments and Finance PLC", percentage: 0.9 },
          { name: "Life Insurance Corporation of India", percentage: 0.8 },
          { name: "Softlogic Holdings PLC", percentage: 0.7 },
          { name: "Lanka ORIX Leasing Company PLC", percentage: 0.6 }
        ]
      },
      {
        year: 2023,
        data: [
          { name: "John Keells Holdings PLC", percentage: 22.4 },
          { name: "Employees Provident Fund", percentage: 15.2 },
          { name: "National Savings Bank", percentage: 8.5 },
          { name: "Bank of Ceylon", percentage: 6.9 },
          { name: "Sri Lanka Insurance Corporation Ltd.", percentage: 6.5 },
          { name: "Hatton National Bank PLC", percentage: 3.4 },
          { name: "HSBC International Nominees Ltd.", percentage: 3.1 },
          { name: "Employees Trust Fund", percentage: 2.9 },
          { name: "Melstacorp PLC", percentage: 2.5 },
          { name: "AIA Insurance Lanka Ltd.", percentage: 2.2 },
          { name: "Carson Cumberbatch PLC", percentage: 1.9 },
          { name: "DFCC Bank PLC", percentage: 1.7 },
          { name: "Commercial Bank of Ceylon PLC", percentage: 1.5 },
          { name: "NDB Bank PLC", percentage: 1.3 },
          { name: "Sampath Bank PLC", percentage: 1.1 },
          { name: "Ceylon Guardian Investment Trust PLC", percentage: 0.9 },
          { name: "Mercantile Investments and Finance PLC", percentage: 0.7 },
          { name: "Life Insurance Corporation of India", percentage: 0.6 },
          { name: "Softlogic Holdings PLC", percentage: 0.5 },
          { name: "Lanka ORIX Leasing Company PLC", percentage: 0.4 }
        ]
      },
      {
        year: 2024,
        data: [
          { name: "John Keells Holdings PLC", percentage: 23.7 },
          { name: "Employees Provident Fund", percentage: 16.0 },
          { name: "National Savings Bank", percentage: 8.9 },
          { name: "Bank of Ceylon", percentage: 7.2 },
          { name: "Sri Lanka Insurance Corporation Ltd.", percentage: 6.9 },
          { name: "Hatton National Bank PLC", percentage: 3.2 },
          { name: "HSBC International Nominees Ltd.", percentage: 2.9 },
          { name: "Employees Trust Fund", percentage: 2.7 },
          { name: "Melstacorp PLC", percentage: 2.3 },
          { name: "AIA Insurance Lanka Ltd.", percentage: 2.0 },
          { name: "Carson Cumberbatch PLC", percentage: 1.7 },
          { name: "DFCC Bank PLC", percentage: 1.5 },
          { name: "Commercial Bank of Ceylon PLC", percentage: 1.3 },
          { name: "NDB Bank PLC", percentage: 1.1 },
          { name: "Sampath Bank PLC", percentage: 0.9 },
          { name: "Ceylon Guardian Investment Trust PLC", percentage: 0.7 },
          { name: "Mercantile Investments and Finance PLC", percentage: 0.5 },
          { name: "Life Insurance Corporation of India", percentage: 0.4 },
          { name: "Softlogic Holdings PLC", percentage: 0.3 },
          { name: "Lanka ORIX Leasing Company PLC", percentage: 0.2 }
        ]
      }
    ]
  };
  
  export default mockData;