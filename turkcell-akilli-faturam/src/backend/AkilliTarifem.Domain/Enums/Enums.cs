using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AkilliTarifem.Domain.Enums
{
    public enum UserType
    {
        Faturali = 1,
        Faturasiz = 2
    }

    public enum AlertLevel
    {
        Info = 1,
        Warning = 2,
        Critical = 3
    }

    public enum AlertType
    {
        QuotaLow = 1,
        AnomalyDetected = 2,
        RoamingUsage = 3,
        MonthlyForecast = 4
    }

    public enum AddOnType
    {
        Data = 1,
        Voice = 2,
        Sms = 3,
        Mixed = 4
    }
}
