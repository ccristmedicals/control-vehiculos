<?php

namespace App\Services;

class SqlserverService
{
    public function connect()
    {
        $serverName = '192.168.4.20, 1433';

        $connectionOptions = array(
            'database' => env('DBR_DATABASE', 'VEHI24'),
            'uid' => env('DBR_USERNAME', 'profit'),
            'pwd' => env('DBR_PASSWORD', 'profit'),
            'Encrypt' => env('DB_ENCRYPT', 'no'),
            'TrustServerCertificate' => env('DB_TRUST_SERVER_CERTIFICATE', 'true'),
        );

        $conn = sqlsrv_connect($serverName, $connectionOptions);

        if ($conn) {
            return $conn;
        } else {
            die(print_r(sqlsrv_errors(), true));
        }
    }

    public function getPrimaryKeys($conn, $tabla)
    {
        $sql = "SELECT c.COLUMN_NAME
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE c
                    ON c.TABLE_NAME = tc.TABLE_NAME
                    AND c.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                WHERE tc.TABLE_NAME = '$tabla'
                AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'";
        $stmt = sqlsrv_query($conn, $sql);
        $pks = [];
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
            $pks[] = $row['COLUMN_NAME'];
        }
        sqlsrv_free_stmt($stmt);
        return $pks;
    }

    public function close($conn)
    {
        sqlsrv_close($conn);
    }
}
