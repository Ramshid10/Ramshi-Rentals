$products = @(
  'Royal Enfield Classic 350', 'Royal Enfield Hunter 350', 'Royal Enfield Meteor 350',
  'Yamaha MT-15', 'Yamaha R15 V4', 'KTM Duke 200', 'KTM Duke 390', 'Honda Activa 6G',
  'Honda Dio', 'TVS Apache RTR 200', 'TVS Ronin', 'Bajaj Pulsar 150', 'Bajaj Pulsar NS200',
  'Suzuki Gixxer', 'Hero Xpulse 200', 'Maruti Swift', 'Maruti Baleno', 'Hyundai i20',
  'Hyundai Venue', 'Hyundai Creta', 'Kia Seltos', 'Tata Nexon', 'Tata Punch',
  'Toyota Innova Crysta', 'Mahindra XUV700', 'Toyota Fortuner', 'Honda City',
  'Canon EOS 1500D', 'Canon EOS 200D II', 'Canon EOS R10', 'Canon EOS R50',
  'Sony Alpha A6400', 'Sony Alpha A7 III', 'Sony Alpha A7 IV', 'Nikon D5600', 'Nikon Z50',
  'Fujifilm X-S10', 'DJI Mini Drone', 'GoPro Action Camera', 'DJI Osmo Action', 'Projector',
  'Portable Bluetooth Speaker', 'Professional Tripod', 'Camera Gimbal', 'LED Video Light Kit',
  'Wireless Microphone', 'Green Screen Kit', 'Portable Power Station', 'Camping Tent'
)
$brands = @('royal', 'enfield', 'maruti', 'hyundai', 'kia', 'tata', 'toyota', 'mahindra', 'honda', 'canon', 'sony', 'nikon', 'fujifilm', 'suzuki', 'bajaj', 'hero', 'yamaha', 'tvs', 'ktm')
$refreshNames = @('Royal Enfield Meteor 350', 'TVS Ronin', 'Maruti Swift', 'Hyundai i20', 'Tata Nexon', 'Honda City', 'Sony Alpha A7 III', 'Sony Alpha A7 IV', 'DJI Mini Drone', 'Projector')
$success = [System.Collections.Generic.List[object]]::new()
$failures = [System.Collections.Generic.List[string]]::new()
$credits = [System.Collections.Generic.List[string]]::new()

foreach ($name in $products) {
  $slug = (($name.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-'))
  $file = "images\$slug.jpg"
  if ((Test-Path $file) -and $name -notin $refreshNames) { continue }

  try {
    $search = [uri]::EscapeDataString($name)
    $api = "https://api.openverse.org/v1/images/?q=$search&page_size=10"
    $result = Invoke-RestMethod -Uri $api -Headers @{ 'User-Agent' = 'RentoraRentals/1.0 (product catalog image retrieval)' }
    $pages = @($result.results)
    $tokens = @($name.ToLowerInvariant() -split '[^a-z0-9]+' | Where-Object { $_.Length -gt 1 -and $_ -notin $brands })
    $requiredTokens = @($tokens | Where-Object { $_ -match '\d' -or $_ -match '^(i|ii|iii|iv)$' })
    $ranked = foreach ($page in $pages) {
      $title = $page.title.ToLowerInvariant()
      $score = @($tokens | Where-Object { $title.Contains($_) }).Count
      $requiredScore = @($requiredTokens | Where-Object { $title.Contains($_) }).Count
      [pscustomobject]@{ Entry = $page; Score = $score; RequiredScore = $requiredScore }
    }
    $best = $ranked | Where-Object { $_.RequiredScore -eq $requiredTokens.Count } | Sort-Object @{ Expression = 'Score'; Descending = $true } | Select-Object -First 1
    if (-not $best -or $best.Score -lt 1) { throw 'No model-matching Flickr image title found' }

    Invoke-WebRequest -Uri $best.Entry.thumbnail -OutFile $file -Headers @{ 'User-Agent' = 'RentoraRentals/1.0' }

    $credits.Add("$slug.jpg | $($best.Entry.title) | $($best.Entry.creator) | $($best.Entry.license) $($best.Entry.license_version) | $($best.Entry.foreign_landing_url)")
    $success.Add([pscustomobject]@{ Model = $name; FlickrTitle = $best.Entry.title; Bytes = (Get-Item $file).Length })
  } catch {
    $failures.Add("$name : $($_.Exception.Message)")
  }

  if ($success.Count -ge 6) { break }
}

[System.IO.File]::AppendAllLines((Join-Path (Get-Location) 'images\credits.txt'), $credits, [System.Text.Encoding]::UTF8)
'DOWNLOADED'
$success | Format-Table -AutoSize
'NOT FOUND'
$failures
'TOTAL'
$success.Count